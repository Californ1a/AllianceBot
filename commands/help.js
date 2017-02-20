const config = require("../config.json");
const pre = config.prefix;
const connection = require("../util/connection.js");
var i = 0;

function intersect(one, two) {
	let a = new Set(one);
	let b = new Set(two);
	var intersection = new Set([...a].filter(x => b.has(x)));
	return intersection;
}

exports.run = (bot, msg, args, perm) => {
	connection.select("*", "commands", `server_id='${msg.guild.id}'`).then(response => {
		if (response[0]) {
			if (!args[0]) {
				const commandNames = Array.from(bot.commands.keys());
				const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);


				var arr1 = [];
				i = 0;
				for (i; i < response.length; i++) {
					arr1.push(response[i].commandname);
				}
				var arr3 = intersect(commandNames, arr1);



				msg.author.sendCode("asciidoc", `= Command List =\n\n[Use ${pre}help <command-name> for details]\n\n${bot.commands.map(c => (c.conf.permLevel<=perm &&  (arr3.has(c.help.name) || perm === 4))?`${c.help.name}${" ".repeat(longest - c.help.name.length)} :: ${c.help.description}`:"").filter(function(val) {return val !== "";}).join("\n")}`);

			} else {
				let command;
				if (bot.commands.has(args[0])) {
					command = args[0];
				} else if (bot.aliases.has(args[0])) {
					command = bot.aliases.get(args[0]);
				}
				if (!command) {
					return msg.channel.sendMessage(`I cannot find the command: ${args[0]}`);
				} else {
					command = bot.commands.get(command);
					if (command.conf.permLevel <= perm) {
						msg.author.sendCode("asciidoc", `= ${command.help.name.charAt(0).toUpperCase()}${command.help.name.slice(1)} = \n${command.help.description}\n\nUsage :: ${pre}${command.help.usage}${(command.help.extendedDescription !== "")?`\n<> Required, [] Optional\n\n${command.help.extendedDescription}`:""}`);
					}
				}
			}

		} else {
			return msg.channel.sendMessage("No commands enabled for this server.");
		}
	});
};



exports.conf = {
	guildOnly: false,
	aliases: ["h"],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "help",
	description: "Displays all the available commands for your permission level or detailed help for a specific command.",
	extendedDescription: "",
	usage: "help [command]"
};
