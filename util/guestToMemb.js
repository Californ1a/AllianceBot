const colors = require("colors");
const cl = require("./chatinfo.js");
const membrolename = require("../config.json").membrolename;
const connection = require("./connection.js");

var guestToMemb = function(bot, msg, cha) {
	connection.select("commandname", "commands", `server_id=${msg.guild.id} AND commandname='automemb'`).then(response => {
		if (!response[0]) {
			if (cha.user.isbot !== "{BOT}") {
				console.log(colors.red("Automemb not enabled for this server."));
			}
			return;
		}
		if (cha.user.toprole.name !== "Guest" && cha.user.isbot !== "{BOT}") {
			return console.log(`User isn't guest?\r\n${cha.user.toprole.name}\r\n${cha.user.isbot}`);
		}
		var botcanassign = false;
		var bu = cl.getMaxRole(msg.guild.members.get(bot.user.id));
		if (bu.toprole.name === "Guest") {
			return console.log(colors.red("Bot cannot assign (Bot is guest)."));
		}
		if (bu.toprole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			if (bu.toprole.position <= cha.user.toprole.position) {
				botcanassign = false;
			} else if (bu.toprole.position - 1 === cha.user.toprole.position) {
				botcanassign = false;
			} else {
				botcanassign = true;
			}
		}
		if (botcanassign && cha.user.isbot !== "{BOT}") {
			msg.member.addRole(msg.guild.roles.find("name", membrolename));
			if (msg.guild.id === "83078957620002816") {
				msg.reply(`Welcome to the discord! You are now a ${membrolename}. Make sure to read the #rules_and_info channel.`);
			} else {
				msg.reply(`Welcome to the discord! You are now a ${membrolename}.`);
			}
		} else if (cha.user.isbot === "{BOT}") {
			return;
		} else {
			console.log(colors.red(`Bot does not have permission to assign ${membrolename}.`));
		}
	}).catch(e => console.error(e.stack));
};

module.exports = {
	guestToMemb
};
