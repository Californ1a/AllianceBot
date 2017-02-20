const pre = require("../config.json").prefix;
const connection = require("../util/connection.js");
const colors = require("colors");

exports.run = (bot, msg, args) => {
	if (!isNaN(args[0]) || args[0].includes(pre) || args.length > 1) {
		msg.channel.sendMessage(`Incorrect syntax. Use \`${pre}help delcom\` for help.`);
	} else {
		console.log(colors.red(`Attempting to remove the command \`${args[0]}\` from server \`${msg.guild.name}\`.`));
		connection.del("servcom", `comname='${args[0]}' AND server_id=${msg.guild.id}`).then(() => {
			console.log(colors.red("Successfully removed command."));
			msg.channel.sendMessage("Success.");
		}).catch(e => {
			console.error(e.stack);
			msg.channel.sendMessage("Failed.");
		});
	}
};

exports.conf = {
	guildOnly: false,
	aliases: ["dc"],
	permLevel: 2,
	onCooldown: false,
	cooldownTimer: 5000
};

exports.help = {
	name: "delcom",
	description: "Delete a custom command.",
	extendedDescription: `<command-name>\n* Name of command without prefix\n\n= Examples =\n"${pre}delcom spook" :: This will delete the "${pre}spook" command.`,
	usage: "delcom <command-name>"
};
