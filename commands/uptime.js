const send = require("../util/sendMessage.js");

function formatUptime(amount) {
	let out = "Bot uptime: ";
	let days = 0;
	let hours = 0;
	let mins = 0;
	let secs = 0;

	amount = Math.floor(amount);
	days = Math.floor(amount / 86400); //days
	amount %= 86400;
	hours = Math.floor(amount / 3600); //hours
	amount %= 3600;
	mins = Math.floor(amount / 60); //minutes
	amount %= 60;
	secs = Math.floor(amount); //seconds

	if (days !== 0) {
		out += days + " day" + ((days !== 1) ? "s" : "") + ", ";
	}
	if (days !== 0 || hours !== 0) {
		out += hours + " hour" + ((hours !== 1) ? "s" : "") + ", ";
	}
	if (days !== 0 || hours !== 0 || mins !== 0) {
		out += mins + " minute" + ((mins !== 1) ? "s" : "") + ", ";
	}
	out += secs + " seconds.";
	return out;

}

exports.run = (bot, msg) => {
	const uptime = process.uptime();
	send(msg, formatUptime(uptime));
};

exports.conf = {
	guildOnly: false,
	aliases: [],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "uptime",
	description: "Display basic uptime.",
	extendedDescription: "",
	usage: "uptime"
};
