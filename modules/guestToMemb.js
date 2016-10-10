var colors = require("colors");
var cl = require("./chatinfo.js");
var membrolename = require("../config/options.json").membrolename;

var addGuestToMemb = function(connection, message, cha, bot) {
	//console.log(message.guild.roles.find("name", modrolename));
	connection.query("SELECT commandname FROM commands WHERE server_id=" + message.guild.id + " AND commandname='automemb'", function(error, enabledforserver) {
		if (error) {
			message.channel.sendMessage(message, "Failed.");
			console.log(error);
			return;
		}
		else {
			if (typeof enabledforserver[0] !== "object") {
				if (cha.user.isbot !== "{BOT}") {
					console.log(colors.red("Automemb not enabled for this server."));
				}
			}
			else {

				if (cha.user.toprole.name !== "Guest" && cha.user.isbot !== "{BOT}") {
					console.log("User isn't guest?");
				}

				var botcanassign = false;
				var bu = cl.getMaxRole(message.guild.members.get(bot.user.id));
				if (bu.toprole.name === "Guest") {
					console.log(colors.red("Bot cannot assign (Bot is guest)."));
				}
				else {

					if (bu.toprole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
						if (bu.toprole.position <= cha.user.toprole.position) {
							botcanassign = false;
						}
						else if (bu.toprole.position - 1 === cha.user.toprole.position) {
							botcanassign = false;
						}
						else {
							botcanassign = true;
						}
					}
					else {
						botcanassign = false;
					}
				}
				if (botcanassign && cha.user.isbot !== "{BOT}") {
					message.member.addRole(message.guild.roles.find("name", membrolename));
					if (message.guild.id === "83078957620002816") {
						message.reply("Welcome to the discord! You are now a " + membrolename + ". Make sure to read the #rules_and_info channel.");
					}
					else {
						message.reply("Welcome to the discord! You are now a " + membrolename + ".");
					}

				}
				else if (cha.user.isbot === "{BOT}") {
					return;
				}
				else {
					console.log(colors.red("Bot does not have permission to assign " + membrolename + "."));
				}
			}
		}
	});
};

module.exports = {
  addGuestToMemb
};
