//const pre = require("../config.json").prefix;
const send = require("../util/sendMessage.js");
const connection = require("../util/connection.js");
const manageTimeout = require("../util/manageTimeout.js");
const parse = require("parse-duration");
const Duration = require("duration-js");
const canUserAndBotAssign = require("../util/canAssignRole.js");
require("../util/Array.prototype.rejoin.js");

exports.run = (bot, msg, args) => {
	const pre = bot.servConf.get(msg.guild.id).prefix;
	const msgMember = msg.member;
	const botMember = msg.guild.members.get(bot.user.id);
	const conf = bot.servConf.get(msg.guild.id);
	const toRole = (conf.timeoutrole) ? msg.guild.roles.find("name", conf.timeoutrole) : msg.guild.roles.find("name", "Timeout");
	const prefix = conf.prefix;
	if (!toRole) {
		return send(msg.channel, `The Timeout role could not be found. Make sure a Timeout role is set in your server config: \`${pre}config --to <role name here>\``);
	}
	if (msgMember.highestRole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
		if (!(args.length >= 2) || !msg.mentions.users.first()) {
			return send(msg.channel, `Incorrect syntax. Use \`${prefix}help timeout\` for syntax.`);
		}
		const mentionedMember = msg.guild.members.get(msg.mentions.users.first().id);
		if (msg.mentions.users.first() && args.length === 1) {
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
		const duration = args.rejoin(" ", 1);
		const durationMS = parse(duration);
		if (durationMS < 0) {
			return send(msg.channel, "The duration must be positive.");
		}
		const d = new Duration(`${durationMS}ms`);
		const now = Date.now();
		const later = new Date(now + d);
		const info = {
			memberid: mentionedMember.id,
			"server_id": msg.guild.id,
			enddate: later
		};
		connection.insert("timeout", info).then(() => {
			mentionedMember.addRole(toRole);
			send(msg.channel, `${mentionedMember.displayName} has been put in timeout for ${d.toString()}.`);
			const toTimer = setTimeout(() => {
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
	extendedDescription: "<mention>\n* An @mention for the user you want to time out.\n\n<duration>\n* Amount of time to leave the user in timeout.\n\n= Examples =\n\"timeout @Alliance 1min 5s\" :: This will place 'Alliance' in timeout for 1 minute 5 seconds.",
	usage: "timeout <mention> <duration>"
};
