const parse = require("parse-duration");
const Duration = require("duration-js");
const connection = require("../util/connection.js");
//const escape = require("../util/escapeChars.js");
const reminders = require("../util/reminders.js");
const reminderCheckTime = require("../config.json").reminders;
const send = require("../util/sendMessage.js");

exports.run = (bot, msg, args, perm, cmd, flags) => {
	if (!flags || !flags.message || !flags.duration) {
		return send(msg.channel, "You must include both a duration and a message.");
	}
	var durationMS = parse(flags.duration);
	var d = Duration.parse(`${durationMS}ms`);
	var now = Date.now();
	var current = new Date();
	var later = new Date(now + d);
	//var escdMsg = escape.chars(flags.message);
	var info = {
		userid: msg.author.id,
		server_id: msg.guild.id,
		message: `'${flags.message}'`,
		msinitduration: durationMS,
		reminddate: later,
		initdate: current
	};
	connection.insert("reminders", info).then(() => {
		reminders.refresh(bot);
	}).then(() => {
		send(msg.channel, `${msg.author}, Success. I will PM you a reminder within ${reminderCheckTime}min after ${later.toString()}`);
	}).catch(e => {
		send(msg.channel, "Failed");
		console.error(e);
	});
};

exports.conf = {
	guildOnly: false,
	aliases: ["rm"],
	permLevel: 1,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "remindme",
	description: "Set a reminder.",
	extendedDescription: "",
	usage: "remindme --duration <time from now> --message <message>"
};

exports.f = {
	duration: ["duration", "d"],
	message: ["message", "msg", "m"]
};
