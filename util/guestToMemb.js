const colors = require("colors");
const membrolename = require("../config.json").membrolename;
const connection = require("./connection.js");

var guestToMemb = function(bot, msg) {
	connection.select("commandname", "commands", `server_id=${msg.guild.id} AND commandname='automemb'`).then(response => {
		if (!response[0]) {
			if (!msg.author.bot) {
				console.log(colors.red("Automemb not enabled for this server."));
			}
			return;
		}
		if (msg.member.highestRole.name !== "@everyone" && !msg.author.bot) {
			return console.log(`User isn't guest? (${msg.member.highestRole.name}) (${msg.author.bot})`);
		}
		var botcanassign = false;
		//var bu = cl.getMaxRole(msg.guild.members.get(bot.user.id));
		var botMemb = msg.guild.members.get(bot.user.id);
		if (botMemb.highestRole.name === "@everyone") {
			return console.log(colors.red("Bot cannot assign (Bot is guest)."));
		}
		if (botMemb.highestRole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			if (botMemb.highestRole.position <= msg.member.highestRole.position) {
				botcanassign = false;
			} else if (botMemb.highestRole.position - 1 === msg.member.highestRole.position) {
				botcanassign = false;
			} else {
				botcanassign = true;
			}
		}
		if (botcanassign && !msg.author.bot) {
			msg.member.addRole(msg.guild.roles.find("name", membrolename));
			if (msg.guild.id === "83078957620002816") {
				msg.reply(`Welcome to the discord! You are now a ${membrolename}. Make sure to read the #rules_and_info channel.`);
			} else {
				msg.reply(`Welcome to the discord! You are now a ${membrolename}.`);
			}
		} else if (msg.author.bot) {
			return;
		} else {
			console.log(colors.red(`Bot does not have permission to assign ${membrolename}.`));
		}
	}).catch(e => console.error(e.stack));
};

module.exports = {
	guestToMemb
};
