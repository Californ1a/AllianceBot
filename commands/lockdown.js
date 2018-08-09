const parse = require("parse-duration");
const Duration = require("duration-js");
const send = require("../util/sendMessage.js");
let timeout;

const lockIt = (msg, roles) => {
	for (const r of roles) {
		msg.channel.overwritePermissions(r, {
			"SEND_MESSAGES": false
		}, "Channel lockdown").catch(console.error);
	}
};

const unlockIt = (msg, roles) => {
	for (const r of roles) {
		msg.channel.overwritePermissions(r, {
			"SEND_MESSAGES": null
		}, "Revert channel lockdown").catch(console.error);
	}
	msg.channel.locked = false;
	msg.channel.timeoutRoles = [];
	if (timeout) {
		clearTimeout(timeout);
	}
};

exports.run = (bot, msg, args) => {
	const time = args.join(" ");
	if (!msg.channel.timeoutRoles) {
		msg.channel.timeoutRoles = [];
	}
	const roles = msg.channel.timeoutRoles;
	if (!time && msg.channel.locked && roles[0]) {
		send(msg, "Do you want to force end the lockdown early?");
		msg.channel.awaitMessages(r => (r.content === "y" || r.content === "yes" || r.content === "n" || r.content === "no") && msg.author.id === r.author.id, {
			max: 1,
			time: 30000,
			errors: ["time"]
		}).then((collected) => {
			if (collected.first().content === "n" || collected.first().content === "no") {
				return send(msg.channel, "Lockdown will continue.");
			}
			unlockIt(msg, roles);
			return send(msg, "Channel force unlocked.").catch(console.error);
		}).catch(() => {
			return send(msg.channel, "You took too long to respond. Lockdown will continue.");
		});
	} else if (!time) {
		return send(msg.channel, "You must specify a duration.");
	}
	if (msg.channel.locked) {
		return send(msg.channel, "This channel is already locked. You can use `lockdown` with no arguments to force unlock.");
	}
	roles.push(msg.guild.roles.find(val => val.name === "@everyone"));
	if (msg.guild.roles.exists("name", args[args.length - 1])) {
		roles.push(msg.guild.roles.find(val => val.name === args[args.length - 1]));
	}
	const durationMS = parse(time);
	const d = Duration.parse(`${durationMS}ms`);
	send(msg.channel, `Channel locked for ${d.toString()}.`).catch(console.error);
	lockIt(msg, roles);
	msg.channel.locked = true;
	timeout = setTimeout(() => {
		unlockIt(msg, roles);
		send(msg.channel, `Channel unlocked after ${d.toString()} of lockdown.`).catch(console.error);
	}, d.milliseconds());
};

exports.conf = {
	guildOnly: true,
	aliases: ["ld"],
	permLevel: 2,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "lockdown",
	description: "Lock down a channel for a set duration. Prevents `@everyone` role from sending messages.",
	extendedDescription: "<duration>\n* Amount of time to keep the channel locked\n\n<extra-role>\n* A single additional role name can be specified to also be muted during this time.\n\n= Examples =\n\"lockdown 1min 30s\" :: This will put the channel on lockdown for 1 minute 30 seconds\n\"ld 1h 20m 50sec Member\" :: This will put the channel on lockdown for 1 hour 20 minutes 50 seconds, and also mute the `Member` role for the same duration",
	usage: "lockdown <duration> [extra-role]"
};
