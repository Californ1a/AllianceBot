//const pre = require("../config.json").prefix;
const send = require("../util/sendMessage.js");
const canUserAndBotAssign = require("../util/canAssignRole.js");
require("../util/Array.prototype.rejoin.js");

exports.run = (bot, msg, args) => {
	const pre = bot.servConf.get(msg.guild.id).prefix;
	const msgMember = msg.member;
	const botMember = msg.guild.members.get(bot.user.id);
	if (msgMember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
		if (!(args.length >= 3) || !msg.mentions.users.first()) {
			return send(msg.channel, `Incorrect syntax. Use \`${pre}help role\` for syntax.`);
		}
		const mentionedMember = msg.guild.members.get(msg.mentions.users.first().id);
		if (!canUserAndBotAssign(msgMember, mentionedMember, botMember)) {
			return send(msg.channel, "Either the bot or you do not have permission to perform this action.");
		}
		const addRole = args.rejoin(" ", 2);
		if (!msg.guild.roles.some(val => val.name === addRole)) {
			return send(msg.channel, `Role \`${addRole}\` does not exist.`);
		}
		const roleToAddDel = msg.guild.roles.find(val => val.name === addRole);
		if (args[0] === "set" || args[0] === "add") {
			if (msgMember.highestRole.position <= roleToAddDel.position) {
				return send(msg.channel, "You cannot assign a role equal to or higher than your own highest role.");
			}
			mentionedMember.addRole(roleToAddDel);
			send(msg.channel, `Added \`${mentionedMember.displayName}\` to the \`${addRole}\` role.`);
		} else if (args[0] === "del") {
			mentionedMember.removeRole(roleToAddDel);
			send(msg.channel, `Removed \`${mentionedMember.displayName}\` from the \`${addRole}\` role.`);
		} else {
			send(msg.channel, "Invalid syntax.");
		}
	}
};

exports.conf = {
	guildOnly: true,
	aliases: [],
	permLevel: 2,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "role",
	description: "Set or remove roles.",
	extendedDescription: "<set(add)|del>\n* Either add or remove the specified role\n\n<mention>\n* An @mention for the user you want to edit the role of.\n\n<role-name>\n* Name of the role to assign or remve.\n\n= Examples =\n\"role set @Alliance Member\" :: This will assign the role \"Member\" to the user \"Alliance\".",
	usage: "role <set|del> <mention> <role-name>"
};
