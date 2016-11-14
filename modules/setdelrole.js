const cl = require("./chatinfo.js");

var canUserAndBotAssign = function(assigner, assignee, buer) {
	if (assigner.toprole.name !== "Guest" && buer.toprole.name !== "Guest" && assigner.toprole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") && buer.toprole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") && assigner.toprole.position > assignee.toprole.position && buer.toprole.position > assignee.toprole.position) {
		return true;
	} else {
		return false;
	}
};

var setDelRole = function(bot, message, modrolename, membrolename, prefix) {
	var user = cl.getMaxRole(message.guild.members.get(message.author.id));
	var bu = cl.getMaxRole(message.guild.members.get(bot.user.id));
	if (user.toprole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
		var str = message.content;
		var results = str.split(" ");
		if (typeof results[1] === "string" && results[1] === "help") {
			message.channel.sendMessage("Syntax: `" + prefix + "role <set|del> <mention> <role name>`\nUse `set` to assign a role to a user or `del` to remove a role from a user. Replace `mention` with an '@' mention of the user, and `role name` with the name of the role you want to assign to that user.");
		} else if (results.length === 4) {
			if (message.mentions.users.first()) {
				var mentionedUser = message.guild.members.get(message.mentions.users.first().id);
				//console.log(mentionedUser);
				var cha = cl.getMaxRole(mentionedUser);
				if (canUserAndBotAssign(user, cha, bu)) {
					if (message.guild.roles.exists("name", results[3])) {
						if (results[1] === "set") {
							mentionedUser.addRole(message.guild.roles.find("name", results[3]));
							if (mentionedUser.nickname) {
								message.channel.sendMessage("Added `" + mentionedUser.nickname + "` to the `" + results[3] + "` role.");
							} else {
								message.channel.sendMessage("Added `" + mentionedUser.user.username + "` to the `" + results[3] + "` role.");
							}
						} else if (results[1] === "del") {
							mentionedUser.removeRole(message.guild.roles.find("name", results[3]));
							if (mentionedUser.nickname) {
								message.channel.sendMessage("Removed `" + mentionedUser.nickname + "` from the `" + results[3] + "` role.");
							} else {
								message.channel.sendMessage("Removed `" + mentionedUser.user.username + "` from the `" + results[3] + "` role.");
							}
						} else {
							message.channel.sendMessage("Invalid syntax.");
						}
					} else {
						message.channel.sendMessage("Role `" + results[3] + "` does not exist.");
					}
				} else {
					message.channel.sendMessage("Either the bot or you do not have permission to perform this action.");
				}
			} else {
				message.channel.sendMessage("Invalid syntax.");
			}
		} else {
			message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "role help` for syntax.");
		}
	}
};

module.exports = {
	setDelRole
};
