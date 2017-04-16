//const config = require("../config.json");
const connection = require("../util/connection.js");
const colors = require("colors");
const escape = require("../util/escapeChars.js");
const cl = require("../util/chatinfo.js");
const fs = require("fs-extra");
const guestToMemb = require("../util/guestToMemb.js").guestToMemb;
const parseFlags = require("../util/parseFlags.js");
const customQuotes = require("../util/customQuotes.js").ripWin;
var pre;

module.exports = (bot, meter, msg) => {
	if (!msg.guild) {
		console.log(colors.grey(`(Private) ${msg.author.username}: ${msg.cleanContent}`));
		if (msg.content.startsWith(pre) && !msg.author.bot) {
			msg.author.sendMessage("Using commands via PM is not supported as I have no indication of which server you want to access the commands for. Please use the command from within the server - To view which commands are enabled for your server, use the \`${pre}help\` command within that server.");
		}
		return;
	}
	var conf = bot.servConf.get(msg.guild.id);
	pre = conf.prefix;
	var membrole = conf.membrole;
	var cha = cl.formatChatlog(msg);
	meter.mark();
	fs.appendFile(cha.currentLog, `${cha.chatlinedata}${cha.formattedAtturls}\r\n`, function(error) {
		if (error) {
			console.log(msg.content);
			console.error(error.stack);
		} else {
			console.log(colors.white(cha.consoleChat + cha.formattedAtturls));
		}
	});
	fs.appendFile(cha.fullLog, `${cha.chatlinedata}${cha.formattedAtturls}\r\n`, function(error) {
		if (error) {
			console.log(msg.content);
			console.error(error.stack);
		}
	});
	if (membrole && !msg.guild.members.get(msg.author.id).roles.exists("name", membrole)) {
		guestToMemb(bot, msg);
	}
	if (!msg.content.startsWith(pre)) {
		return;
	}
	if (msg.author.bot) {
		return;
	}

	let command = msg.content.split(" ")[0].slice(pre.length).toLowerCase();
	let perms = bot.elevation(msg);
	let args = msg.content.split(" ").slice(1);

	let escapedCom = escape.chars(command);
	connection.select("*", "servcom", `server_id='${msg.guild.id}' AND comname='${escapedCom}'`).then(response => {
		if (response[0]) {
			let strs;
			let results;
			if (response[0].comtext) {
				strs = response[0].comtext;
				results = strs.slice(1, strs.length - 1);
			}
			if (response[0].permlvl <= perms) {
				if (response[0].type === "simple") {
					if (response[0].inpm === "true") {
						return msg.author.sendMessage(results);
					} else {
						return msg.channel.sendMessage(results);
					}
				} else if (response[0].type === "quote") {
					customQuotes(msg, args, command, perms);
					return;
				}
				return;
			}
		}
	}).catch(e => console.error(e.stack));



	let cmd;
	if (bot.commands.has(command)) {
		cmd = bot.commands.get(command);
	} else if (bot.aliases.has(command)) {
		cmd = bot.commands.get(bot.aliases.get(command));
	}
	if (cmd) {
		if (perms < cmd.conf.permLevel || cmd.conf.onCooldown || cmd.conf.endGameCooldown) {
			if (cmd.help.name === "strivia" || cmd.help.name === "num" || cmd.help.name === "scramble") {
				msg.channel.sendMessage("This command is on cooldown (1 minute cooldown after game ends) or is otherwise unavailable at this time. Try again in a few minutes.");
			}
			return;
		}
		connection.select("commandname", "commands", `server_id=${msg.guild.id} AND commandname='${cmd.help.name}'`).then(response => {
			if (!response[0] && cmd.conf.perm < 4) {
				console.log(colors.red("Command not enabled for this server."));
				return;
			}
			console.log(colors.red("Command enabled for this server."));
			cmd.conf.onCooldown = true;
			var flags;
			if (cmd.flags) {
				flags = parseFlags(cmd, args);
			}
			cmd.run(bot, msg, args, perms, cmd, flags);
			setTimeout(() => {
				cmd.conf.onCooldown = false;
			}, cmd.conf.cooldownTimer);
		}).catch(e => console.error(e.stack));
	}
};
