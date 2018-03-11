//const pre = require("../config.json").prefix;
const timers = require("../util/timers.js");
const send = require("../util/sendMessage.js");

exports.run = (bot, msg) => {
	const pre = bot.servConf.get(msg.guild.id).prefix;
	const forSS = {
		"bool": true
	};
	const currentss = timers.getCount(false, "The next SS will begin in ", forSS);
	send(msg.channel, `${currentss} Use ${pre}speedy for full SS information.`);
};

exports.conf = {
	guildOnly: true,
	aliases: [],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "ss",
	description: "Get the time remaining until the next Speedy Saturday, or the time remaining if it's currently happening.",
	extendedDescription: "",
	usage: "ss"
};
