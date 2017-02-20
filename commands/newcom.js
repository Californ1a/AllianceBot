const connection = require("../util/connection.js");
const colors = require("colors");
const config = require("../config.json");
const escape = require("../util/escapeChars.js");
const pre = config.prefix;
const modrolename = config.modrolename;
const membrolename = config.membrolename;
const adminrolename = config.adminrolename;


exports.run = (bot, msg, args) => {
	//let cmd = msg.content.split(" ")[0].slice(config.prefix.length);
	if (!isNaN(args[0]) || args[0].includes(pre) || args.length < 4 || isNaN(args[1]) || parseInt(args[1]) > 4 || parseInt(args[1]) < 0 || (args[2] !== "true" && args[2] !== "false")) {
		msg.channel.sendMessage(`Incorrect syntax. Use \`${pre}help newcom\` for help.`);
	} else {
		var cmdname = escape.chars(args[0]);
		var permslvl = parseInt(args[1]);
		var inpms = args[2];
		var fullmsg = args;
		fullmsg.splice(0,3);
		var escdMsg = escape.chars(fullmsg.join(" "));
		console.log(colors.red(`Attempting to add the command \`${cmdname}\` with the resulting message \`${escdMsg}\` to server \`${msg.guild.name}\`.`));
		var info = {
			"comname": cmdname,
			"comtext": `'${escdMsg}'`,
			"permlvl": permslvl,
			"inpm": inpms,
			"server_id": msg.guild.id
		};
		connection.insert("servcom", info).then(() => {
			console.log(colors.red("Successfully inserted command."));
			msg.channel.sendMessage("Success.");
		}).catch(e => {
			msg.channel.sendMessage("Failed.");
			console.error(e.stack);
			return;
		});
	}
};



exports.conf = {
	guildOnly: false,
	aliases: ["nc"],
	permLevel: 2,
	onCooldown: false,
	cooldownTimer: 5000
};

exports.help = {
	name: "newcom",
	description: "Create a simple custom command.",
	extendedDescription: `<command-name>\n* Name of command without prefix\n\n\<perm-level> (0-3)\n* 0 is @everyone, 1 is ${membrolename}s, 2 is ${modrolename}s, 3 is ${adminrolename}\n\n<reply-in-pm> (true|false)\n* Reply to command in a PM rather than in-channel.\n\n<message>\n* The message to be sent when command is given.\n\n= Examples =\n"${pre}newcom spook 0 false BOO! Scared ya!" :: The new command would be "${pre}spook" (enabled for all members and would reply in-channel) and the returned message would be "BOO! Scared ya!"`,
	usage: "newcom <command-name> <perm-level> <reply-in-pm> <message>"
};
