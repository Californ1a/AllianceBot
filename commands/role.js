const pre = ("../config.json").prefix;
require("../util/Array.prototype.rejoin.js");

function canUserAndBotAssign(assigner, assignee, buer) {
	if (assigner.highestRole.position !== 0 && buer.highestRole.name !== 0 && assigner.highestRole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") && buer.highestRole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") && assigner.highestRole.position > assignee.highestRole.position && buer.highestRole.position > assignee.highestRole.position) {
		return true;
	} else {
		return false;
	}
}

exports.run = (bot, msg, args) => {
	var msgMember = msg.member;
	var botMember = msg.guild.members.get(bot.user.id);
	if (msgMember.highestRole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
		if (!(args.length >= 3) || !msg.mentions.users.first()) {
			return msg.channel.sendMessage(`Incorrect syntax. Use \`${pre}help role\` for syntax.`);
		}
		var mentionedMember = msg.guild.members.get(msg.mentions.users.first().id);
		if (!canUserAndBotAssign(msgMember, mentionedMember, botMember)) {
			return msg.channel.sendMessage("Either the bot or you do not have permission to perform this action.");
		}
		var addRole = args.rejoin(" ", 2);
		if (!msg.guild.roles.exists("name", addRole)) {
			return msg.channel.sendMessage(`Role \`${addRole}\` does not exist.`);
		}
		if (args[0] === "set" || args[0] === "add") {
			mentionedMember.addRole(msg.guild.roles.find("name", addRole));
			msg.channel.sendMessage(`Added \`${mentionedMember.displayName}\` to the \`${addRole}\` role.`);
		} else if (args[0] === "del") {
			mentionedMember.removeRole(msg.guild.roles.find("name", args[2]));
			msg.channel.sendMessage(`Removed \`${mentionedMember.displayName}\` from the \`${addRole}\` role.`);
		} else {
			msg.channel.sendMessage("Invalid syntax.");
		}
	}
};

exports.conf = {
	guildOnly: false,
	aliases: [],
	permLevel: 2,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "role",
	description: "Set or remove roles.",
	extendedDescription: `<set(add)|del>\n* Either add or remove the specified role\n\n<mention>\n* An @mention for the user you want to edit the role of.\n\n<role-name>\n* Name of the role to assign or remve.\\n= Examples =\n"${pre}role set @Alliance Member" :: This will assign the role "Member" to the user "Alliance".`,
	usage: "role <set|del> <mention> <role-name>"
};
