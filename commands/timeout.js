const pre = require("../config.json").prefix;
const send = require("../util/sendMessage.js");
const connection = require("../util/connection.js");
const manageTimeout = require("../util/manageTimeout.js");
const parse = require("parse-duration");
const Duration = require("duration-js");
require("../util/Array.prototype.rejoin.js");

function canUserAndBotAssign(assigner, assignee, buer) {
	if (assigner.highestRole.position !== 0 && buer.highestRole.name !== 0 && assigner.highestRole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") && buer.highestRole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") && assigner.highestRole.position > assignee.highestRole.position && buer.highestRole.position > assignee.highestRole.position) {
		return true;
	} else {
		return false;
	}
}

exports.run = (bot, msg, args) => {
	let msgMember = msg.member;
	let botMember = msg.guild.members.get(bot.user.id);
	let conf = bot.servConf.get(msg.guild.id);
	let toRole = (conf.timeoutrole) ? msg.guild.roles.find("name", conf.timeoutrole) : msg.guild.roles.find("name", "Timeout");
	let prefix = conf.prefix;
	if (!toRole) {
		return send(msg.channel, `The Timeout role could not be found. Make sure a Timeout role is set in your server config: \`${pre}config --to <role name here>\``);
	}
	if (msgMember.highestRole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
		if (!(args.length >= 2) || !msg.mentions.users.first()) {
			return send(msg.channel, `Incorrect syntax. Use \`${prefix}help role\` for syntax.`);
		}
		let mentionedMember = msg.guild.members.get(msg.mentions.users.first().id);
		if (msg.mentions.users.first() && args.length == 1) {
			if (bot.timer.get(mentionedMember.id)) {
				clearTimeout(bot.timer.get(mentionedMember.id));
			}
			if (mentionedMember.roles.find("name", toRole)) {
				manageTimeout(mentionedMember, bot, toRole, msg.guild.id);
				return send(msg.channel, `${mentionedMember.displayName} was manually removed from timeout.`);
			} else {
				return send(msg.channel, `${mentionedMember.displayName} does not have the Timeout role.`);
			}
		}
		if (!canUserAndBotAssign(msgMember, mentionedMember, botMember)) {
			return send(msg.channel, "Either the bot or you do not have permission to perform this action.");
		}
		let duration = args.rejoin(" ", 1);
		let durationMS = parse(duration);
		if (durationMS < 0) {
			return send(msg.channel, "The duration must be positive.");
		}
		let d = new Duration(`${durationMS}ms`);
		let now = Date.now();
		let later = new Date(now + d);
		let info = {
			memberid: mentionedMember.id,
			server_id: msg.guild.id,
			enddate: later,
		};
		connection.insert("timeout", info).then(() => {
			mentionedMember.addRole(toRole);
			send(msg.channel, `${mentionedMember.displayName} has been put in timeout for ${d.toString()}.`);
			let toTimer = setTimeout(() => {
				manageTimeout(mentionedMember, bot, toRole, msg.guild.id);
			}, d);
			bot.timer.set(mentionedMember.id, toTimer);
		});
	}
};

exports.conf = {
	guildOnly: true,
	aliases: ["to"],
	permLevel: 2,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "timeout",
	description: "Put a user in the 'Timeout' role for a set duration.",
	extendedDescription: `<mention>\n* An @mention for the user you want to edit the role of.\n\n<duration>\n* Amount of time to leave the user in timeout.\n\n= Examples =\n"${pre}timeout @Alliance 1min 5s" :: This will place 'Alliance' in timeout for 1 minute 5 seconds.`,
	usage: "timeout <mention> <duration>"
};
