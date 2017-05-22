//const pre = require("../config.json").prefix;
const connection = require("../util/connection.js");
const colors = require("colors");
const send = require("../util/sendMessage.js");

exports.run = (bot, msg, args) => {
	const pre = bot.servConf.prefix;
	if (args.length !== 1) {
		return send(msg.channel, `Incorrect syntax. Use \`${pre}help delcom\` for help.`);
	}
	connection.select("*", "servcom", `comname='${args[0]}' AND server_id='${msg.guild.id}'`).then(response => {
		if (!response[0]) {
			return send(msg.channel, "Command does not exist.");
		}
		console.log(colors.red(`Attempting to remove the command \`${args[0]}\` from server \`${msg.guild.name}\`.`));
		if (response[0].type === "simple") {
			connection.del("servcom", `comname='${args[0]}' AND server_id='${msg.guild.id}'`).then(() => {
				console.log(colors.red("Successfully removed command."));
				send(msg.channel, "Success");
			}).catch(e => {
				console.error(e);
				send(msg.channel, "Failed");
			});
			return;
		} else if (response[0].type === "quote") {
			connection.select("*", `${response[0].comname}`, `server_id!='${msg.guild.id}'`).then(res => {
				connection.del("servcom", `comname='${args[0]}' AND server_id='${msg.guild.id}'`).then(() => {
					if (!res[0]) {
						connection.query(`DROP TABLE IF EXISTS ${response[0].comname}`).then(() => {
							return send(msg.channel, "Success");
						}).catch(e => {
							send(msg.channel, "Failed");
							console.error(e);
							return;
						});
					} else {
						return send(msg.channel, "Success");
					}
				}).catch(e => {
					send(msg.channel, "Failed");
					console.error(e);
					return;
				});
			}).catch(e => {
				send(msg.channel, "Failed");
				console.error(e);
				return;
			});
		}
	}).catch(e => {
		send(msg.channel, "Failed");
		console.error(e);
		return;
	});
};

exports.conf = {
	guildOnly: true,
	aliases: ["dc"],
	permLevel: 2,
	onCooldown: false,
	cooldownTimer: 5000
};

exports.help = {
	name: "delcom",
	description: "Delete a custom command.",
	extendedDescription: `<command-name>\n* Name of command without prefix\n\n= Examples =\n"delcom spook" :: This will delete the "spook" command.`,
	usage: "delcom <command-name>"
};
