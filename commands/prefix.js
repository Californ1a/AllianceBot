const escape = require("../util/escapeChars.js");
const connection = require("../util/connection.js");

exports.run = (bot, msg, args) => {
	if (!args) {
		return msg.channel.sendMessage("You must specify a new prefix.");
	}
	if (args[1]) {
		return msg.channel.sendMessage("Your prefix cannot have spaces.");
	}
	var newPre = escape.chars(args[0]);
	if (newPre !== args[0]) {
		return msg.channel.sendMessage("You used an invalid character.");
	}
	connection.update("servers", `prefix='${newPre}'`, `serverid='${msg.guild.id}'`).then(() => {
		msg.channel.sendMessage(`Prefix changed to '${newPre}'`);
		bot.confRefresh();
	}).catch(console.error);
};

exports.conf = {
	aliases: ["pre"],
	permLevel: 2,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "prefix",
	description: "Change the bot commands prefix",
	usage: "prefix <prefix>"
};
