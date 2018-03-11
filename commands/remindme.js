const parse = require("parse-duration");
const Duration = require("duration-js");
const connection = require("../util/connection.js");
//const escape = require("../util/escapeChars.js");
const reminders = require("../util/reminders.js");
const reminderCheckTime = require("../config.json").reminders;
const send = require("../util/sendMessage.js");
const colors = require("colors");
const timeout = 5;

exports.run = (bot, msg, args, perm, cmd, flags) => {
	if (!flags || !flags.message || !flags.duration) {
		return send(msg, "You must include both a duration and a message.");
	}
	const durationMS = parse(flags.duration);
	const d = Duration.parse(`${durationMS}ms`);
	const now = Date.now();
	const current = new Date();
	const later = new Date(now + d);
	//var escdMsg = escape.chars(flags.message);
	const info = {
		userid: msg.author.id,
		message: `'${flags.message}'`,
		reminddate: later,
		initdate: current
	};
	connection.insert("reminders", info).then(() => {
		reminders.refresh(bot);
	}).then(() => {
		send(msg, `${msg.author}, Success. I will PM you a reminder within ${reminderCheckTime}min after ${later.toString()}.${(msg.guild) ? `\n\nOthers may click the ⏰ reaction within the next ${(timeout > 1) ? `${timeout} minutes` : "1 minute"} to also be sent the same reminder (removing your reaction will **not** remove your reminder).` : ""}`).then(m => {
			if (!msg.guild) {
				return;
			}
			m.react("⏰").then(() => {
				const collector = m.createReactionCollector(reaction => reaction.emoji.name === "⏰", {
					time: timeout * 60 * 1000
				});
				collector.on("end", () => {
					console.log(colors.red("Reaction collection ended."));
					m.edit(`${msg.author}, Success. I will PM you a reminder within ${reminderCheckTime}min after ${later.toString()}.\n\n~~Others may click the ⏰ reaction within the next ${(timeout > 1) ? `${timeout} minutes` : "1 minute"} to also be sent the same reminder (removing your reaction will **not** remove your reminder)~~.`);
					const userids = [];
					const userids1 = [];
					connection.select("*", "reminders", `message="${info.message}"`).then(response => {
						let i = 0;
						for (i; i < response.length; i++) {
							if (!userids.includes(response[i].userid) && !userids1.includes(response[i].userid)) {
								userids1.push(response[i].userid);
							}
						}
						collector.users.forEach(u => {
							if (!userids.includes(u.id) && !userids1.includes(u.id) && u.id !== bot.user.id && u.id !== msg.author.id) {
								userids.push(u.id);
							}
						});
						const unique = userids.filter((elem, index, self) => {
							return index === self.indexOf(elem);
						});
						if (unique.length === 0) {
							m.clearReactions().catch(e => console.error(e));
							return;
						}
						i = 0;
						for (i; i < unique.length; i++) {
							info.userid = unique[i];
							connection.insert("reminders", info);
						}
						reminders.refresh(bot);
					});
				});
			});
		});
	}).catch(e => {
		send(msg, "Failed");
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
