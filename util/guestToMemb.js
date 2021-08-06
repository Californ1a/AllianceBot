const colors = require("colors");
const membrolename = require("../config.json").membrolename;
const connection = require("./connection.js");
let checked;

const guestToMemb = function(bot, msg) {
	if (checked && checked[msg.guild.id] && checked[msg.guild.id][msg.author.id]) {
		return;
	}
	connection.select("commandname", "commands", `server_id=${msg.guild.id} AND commandname='automemb'`).then(response => {
		if (!response[0]) {
			if (!msg.author.bot) {
				console.log(colors.red("Automemb not enabled for this server."));
				if (checked && checked[msg.guild.id]) {
					checked[msg.guild.id][msg.author.id] = true;
				} else {
					checked = {
						[msg.guild.id]: {
							[msg.author.id]: true
						}
					};
				}
			}
			return;
		}
		if (msg.member.roles.highest.name !== "@everyone" && !msg.author.bot) {
			return console.log(`User isn't guest? (${msg.member.roles.highest.name}) (${msg.author.bot})`);
		}
		let botcanassign = false;
		//var bu = cl.getMaxRole(msg.guild.members.cache.get(bot.user.id));
		const botMemb = msg.guild.members.cache.get(bot.user.id);
		if (botMemb.roles.highest.name === "@everyone") {
			return console.log(colors.red("Bot cannot assign (Bot is guest)."));
		}
		if (botMemb.permissions.has("MANAGE_ROLES")) {
			if (botMemb.roles.highest.position <= msg.member.roles.highest.position) {
				botcanassign = false;
			} else if (botMemb.roles.highest.position - 1 === msg.member.roles.highest.position) {
				botcanassign = false;
			} else {
				botcanassign = true;
			}
		}
		if (botcanassign && !msg.author.bot) {
			msg.member.roles.add(msg.guild.roles.cache.find(val => val.name === membrolename));
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
