const connection = require("../util/connection.js");
const colors = require("colors");
//const pre = require("../config.json").prefix;
const timers = require("../util/timers.js");
const send = require("../util/sendMessage.js");

exports.run = (bot, msg, args, perm) => {
	//console.log(flags);
	let eventName;
	let eventDate;
	let i = 0;
	connection.select("*", "advent", `server_id=${msg.channel.guild.id}`).then(response => {
		if (!response[0] && !args[0]) {
			send(msg.channel, "No event set.");
		} else if (args[0] === "set" && perm >= 2) {
			if (args[1] && !response[0]) {
				if (args[2]) {
					eventName = null;
					eventDate = args[1];
					i = 0;
					for (i; i < args.length; i++) {
						if (i === 2) {
							eventName = args[i];
						} else if (i > 2) {
							eventName = `${eventName} ${args[i]}`;
						}
					}
					console.log(colors.red(`Trying to insert '${eventName}' event into database.`));
					const info = {
						"name": eventName,
						"time": eventDate,
						"server_id": msg.channel.guild.id
					};
					connection.insert("advent", info).then(() => {
						console.log(colors.red("Successfully inserted event."));
						send(msg.channel, `Event name set to: ${eventName}\r\nEvent date set to: ${eventDate}`);
					}).catch(e => {
						send(msg.channel, "Failed");
						console.error(e.stack);
						return;
					});
				} else {
					send(msg.channel, "Incorrect syntax.");
				}
			} else if (!args[1]) {
				send(msg.channel, "Incorrect syntax.");
			} else if (response[0]) {
				send(msg.channel, "You must delete the current event before creating a new one.");
			} else {
				send(msg.channel, "Error.");
				console.log("Something happened.");
			}
		} else if (args[0] === "del" && perm >= 2) {
			console.log(colors.red("Attempting to remove event from the database."));
			connection.del("advent", `server_id=${msg.channel.guild.id}`).then(() => {
				console.log(colors.red("Successfully removed event."));
				send(msg.channel, "Event removed.");
			}).catch(e => {
				send(msg.channel, "Failed.");
				console.error(e.stack);
				return;
			});
		} else if (response[0] && !args[0]) {
			const forSS = {
				"bool": false,
				"eventDate": response[0].time,
				"eventName": response[0].name
			};
			const startMessage = `${response[0].name} will begin in `;
			const currentstream = timers.getCount(false, startMessage, forSS);
			send(msg.channel, `${currentstream}`);
		} else if (response[0]) {
			const pre = bot.servConf.get(msg.channel.guild.id).prefix;
			send(msg.channel, `There is already an event set. Use \`${pre}advent\` to view it.`);
		} else {
			console.log("Something happened.");
		}
	}).catch(e => {
		send(msg.channel, "Failed.");
		console.error(e.stack);
		return;
	});
};

exports.conf = {
	guildOnly: true,
	aliases: [],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "advent",
	description: "Get the time remaining until the preset event. Moderators can set a new event or delete the current event.",
	extendedDescription: "<date>\n* The date and time when the event begins. ISO8601 format with no spaces - use T instead of a space to denote the time. Times must be given in Eastern Time unless an offset is defined.\n\n<event name>\n* The name of the event.\n\n= Examples =\n\"advent set 2016-02-08T13:30:20 Some Name\" :: This would set an event named \"Some Name\" to start at February 8th, 2016 at 1:30:20 PM ET.",
	usage: "advent [set|del] [<date> <event-name>]"
};

exports.f = {
	datetime: ["date", "d", "dt", "t"],
	name: ["name", "n"]
};
