const parse = require("parse-duration");
const Duration = require("duration-js");
const connection = require("../util/connection.js");
const send = require("../util/sendMessage.js");
//let timeout;

const lockIt = (msg, roles) => {
	for (const r of roles) {
		msg.channel.createOverwrite(r, {
			"SEND_MESSAGES": false
		}, "Channel lockdown").catch(console.error);
	}
};

const unlockIt = (bot, msg, roles) => {
	for (const r of roles) {
		msg.channel.updateOverwrite(r, {
			"SEND_MESSAGES": null
		}, "Revert channel lockdown").catch(console.error);
	}
	msg.channel.locked = false;
	msg.channel.timeoutRoles = [];
	if (bot.timer.lockdown.get(msg.channel.id)) {
		clearTimeout(bot.timer.lockdown.get(msg.channel.id));
	}
	connection.del("lockdown", `channel_id=${msg.channel.id} AND server_id=${msg.guild.id}`).catch(console.error);
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
	} else if (msg.channel.locked && args[0]) {
		return send(msg.channel, "This channel is already locked. You can use `lockdown` with no arguments to force unlock.");
	} else if (time) {
		roles.push(msg.guild.roles.cache.find(val => val.name === "@everyone"));
		if (msg.guild.roles.cache.some(val => val.name === args[args.length - 1])) {
			roles.push(msg.guild.roles.cache.find(val => val.name === args[args.length - 1]));
		}
		const durationMS = parse(time);
		const d = Duration.parse(`${durationMS}ms`);
		let now = Date.now();
		const later = new Date(now + d);
		now = new Date(now);


		const info = {
			"server_id": msg.guild.id,
			"channel_id": msg.channel.id,
			"role_id": (roles.length === 2) ? roles[1].id : null,
			startdate: now,
			enddate: later
		};
		connection.insert("lockdown", info).then(() => {
			lockIt(msg, roles);
			send(msg.channel, `Channel locked for ${d.toString()}.`).catch(console.error);
			const toTimer = setTimeout(() => {
				unlockIt(bot, msg, roles);
				send(msg.channel, `Channel unlocked after ${d.toString()} of lockdown.`).catch(console.error);
			}, d);
			bot.timer.lockdown.set(msg.channel.id, toTimer);
		});
	}
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
