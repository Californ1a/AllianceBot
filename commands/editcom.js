const pre = require("../config.json").prefix;
const connection = require("../util/connection.js");
const colors = require("colors");
const escape = require("../util/escapeChars.js");
const config = require("../config.json");
const membrolename = config.membrolename;
const modrolename = config.modrolename;
const adminrolename = config.adminrolename;

exports.run = (bot, msg, args) => {
	if (!isNaN(args[0]) || args[0].includes(pre) || args.length < 4 || isNaN(args[1]) || parseInt(args[1]) > 4 || parseInt(args[1]) < 0 || (args[2] !== "true" && args[2] !== "false")) {
		msg.channel.sendMessage(`Incorrect syntax. Use \`${pre}help newcom\` for help.`);
	} else {
		var comname = escape.chars(args[0]);
		connection.select("idservcom", "servcom", `server_id=${msg.guild.id} AND comname='${comname}'`).then(response => {
			if (!response[0]) {
				console.log(colors.red("Command does not exist."));
			} else {
				console.log(colors.red("Command exists."));
				var permslvl = parseInt(args[1]);
				var inpm = args[2];
				var fullmsg = args;
				fullmsg.splice(0,3);
				var escdMsg = escape.chars(fullmsg.join(" "));
				console.log(inpm);
				console.log(colors.red(`Attempting to edit the command \`${comname}\` with the resulting message \`${escdMsg}\` on server \`${msg.guild.name}\`.`));
				connection.update("servcom", `comtext='\''${escdMsg}'\'', permlvl=${permslvl}, inpm='${inpm}'`, `idservcom=${response[0].idservcom}`).then(() => {
					console.log(colors.red("Successfully edited command."));
					msg.channel.sendMessage("Success.");
				}).catch(e => {
					console.error(e.stack);
					msg.channel.sendMessage("Failed.");
					return;
				});
			}
		}).catch(e => {
			msg.channel.sendMessage("Failed.");
			console.error(e.stack);
			return;
		});
	}
};

exports.conf = {
	guildOnly: false,
	aliases: ["ec"],
	permLevel: 2,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "editcom",
	description: "Edit an already-existing custom command.",
	extendedDescription: `<command-name>\n* Name of command without prefix, must be already-existing\n\n\<perm-level> (0-3)\n* 0 is @everyone, 1 is ${membrolename}s, 2 is ${modrolename}s, 3 is ${adminrolename}\n\n<reply-in-pm> (true|false)\n* Reply to command in a PM rather than in-channel.\n\n<message>\n* The message to be sent when command is given.\n\n= Examples =\n"${pre}newcom spook 0 false BOO! Scared ya!" :: The edited command would be "${pre}spook" (enabled for all members and would reply in-channel) and the returned message would be "BOO! Scared ya!"`,
	usage: "editcom <command-name> <perm-level> <reply-in-pm> <message>"
};
