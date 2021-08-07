const colors = require("colors");
const connection = require("../util/connection.js");
const send = require("../util/sendMessage.js");
exports.run = (bot, msg, args) => {
	let command;
	if (!args[0]) {
		return;
	}
	if (bot.commands.has(args[0])) {
		command = args[0];
	} else if (bot.aliases.has(args[0])) {
		command = bot.aliases.get(args[0]);
	}
	if (!command && args[0] !== "automemb") {
		return send(msg.channel, `I cannot find the command: ${args[0]}`);
	}
	connection.select("commandname", "commands", `server_id=${msg.channel.guild.id} AND commandname='${command}'`).then(response => {
		if (!response[0]) {
			console.log(colors.red(`Trying to insert command '${command}' into database.`));
			const info = {
				"commandname": command,
				"server_id": msg.channel.guild.id
			};
			connection.insert("commands", info).then(() => {
				console.log(colors.red("Successfully added command to server."));
				send(msg.channel, "Successfully added command to server.");
			}).catch(e => {
				send(msg.channel, "Failed.");
				console.error(e.stack);
				return;
			});
		} else {
			console.log(colors.red(`Trying to remove command '${command}' from database.`));
			connection.del("commands", `commandname='${command}' AND server_id=${msg.channel.guild.id}`).then(() => {
				console.log(colors.red("Successfully removed command from server."));
				send(msg.channel, "Successfully removed command from server.");
			}).catch(e => {
				console.error(e.stack);
				send(msg.channel, "Failed.");
				return;
			});
		}
	}).catch(e => console.error(e.stack));
};

exports.conf = {
	guildOnly: true,
	aliases: ["t"],
	permLevel: 4,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "toggle",
	description: "Toggle commands on or off.",
	extendedDescription: "",
	usage: "toggle <command>"
};
