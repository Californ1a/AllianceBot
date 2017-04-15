const connection = require("../util/connection.js");
const colors = require("colors");
const pre = require("../config.json").prefix;
const timers = require("../util/timers.js");

exports.run = (bot, msg, args, perm) => {
	//console.log(flags);
	var eventName;
	var eventDate;
	var i = 0;
	connection.select("*", "advent", `server_id=${msg.guild.id}`).then(response => {
		if (!response[0] && !args[0]) {
			msg.channel.sendMessage("No event set.");
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
					var info = {
						"name": eventName,
						"time": eventDate,
						"server_id": msg.guild.id
					};
					connection.insert("advent", info).then(() => {
						console.log(colors.red("Successfully inserted event."));
						msg.channel.sendMessage(`Event name set to: ${eventName}\r\nEvent date set to: ${eventDate}`);
					}).catch(e => {
						msg.channel.sendMessage("Failed");
						console.error(e.stack);
						return;
					});
				} else {
					msg.channel.sendMessage("Incorrect syntax.");
				}
			} else if (!args[1]) {
				msg.channel.sendMessage("Incorrect syntax.");
			} else if (response[0]) {
				msg.channel.sendMessage("You must delete the current event before creating a new one.");
			} else {
				msg.channel.sendMessage("Error.");
				console.log("Something happened.");
			}
		} else if (args[0] === "del" && perm >= 2) {
			console.log(colors.red("Attempting to remove event from the database."));
			connection.del("advent", `server_id=${msg.guild.id}`).then(() => {
				console.log(colors.red("Successfully removed event."));
				msg.channel.sendMessage("Event removed.");
			}).catch(e => {
				msg.channel.sendMessage("Failed.");
				console.error(e.stack);
				return;
			});
		} else if (response[0] && !args[0]) {
			var forSS = {
				"bool": false,
				"eventDate": response[0].time,
				"eventName": response[0].name
			};
			var startMessage = `${response[0].name} will begin in `;
			var currentstream = timers.getCount(false, startMessage, forSS);
			msg.channel.sendMessage(`${currentstream}`);
		} else if (response[0]) {
			msg.channel.sendMessage(`There is already an event set. Use \`${pre}advent\` to view it.`);
		} else {
			console.log("Something happened.");
		}
	}).catch(e => {
		msg.channel.sendMessage("Failed.");
		console.error(e.stack);
		return;
	});
};

exports.conf = {
	guildOnly: false,
	aliases: [],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "advent",
	description: "Get the time remaining until the preset event. Moderators can set a new event or delete the current event.",
	extendedDescription: `<date>\n* The date and time when the event begins. ISO8601 format with no spaces - use T instead of a space to denote the time. Times must be given in Eastern Time unless an offset is defined.\n\n<event name>\n* The name of the event.\n\n= Examples =\n"${pre}advent set 2016-02-08T13:30:20 Some Name :: nThis would set an event named "Some Name" to start at February 8th, 2016 at 1:30:20 PM ET.`,
	usage: "advent [set|del] [<date>] [<event-name>]"
};

exports.f = {
	datetime: ["date", "d", "dt", "t"],
	name: ["name", "n"]
};
