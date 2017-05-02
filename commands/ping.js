const send = require("../util/sendMessage.js");

exports.run = (bot, msg) => {
	send(msg.channel, "Ping?").then(m => {
		m.edit(`Pong! (took ${m.createdTimestamp - msg.createdTimestamp}ms)`);
	});
};

exports.conf = {
	guildOnly: false,
	aliases: [],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 5000
};

exports.help = {
	name: "ping",
	description: "Simple ping command.",
	extendedDescription: "",
	usage: "ping"
};
