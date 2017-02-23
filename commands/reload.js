exports.run = (bot, msg, args) => {
	let command;
	if (!args[0]) {
		return msg.channel.sendMessage("You must provide a command to reload.");
	}
	if (bot.commands.has(args[0])) {
		command = args[0];
	} else if (bot.aliases.has(args[0])) {
		command = bot.aliases.get(args[0]);
	}
	if (!command) {
		return msg.channel.sendMessage(`I cannot find the command: ${args[0]}`);
	}
	msg.channel.sendMessage(`Reloading: ${command}`).then(m => {
		bot.reload(command).then(() => {
			m.edit(`Successfully reloaded: ${command}`);
		}).catch(e => {
			m.edit(`Command reload failed: ${command}\n\`\`\`${e.stack}\`\`\``);
		});
	});
};

exports.conf = {
	guildOnly: false,
	aliases: ["r"],
	permLevel: 4,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "reload",
	description: "Reloads the command file, if it's been updated or modified.",
	extendedDescription: "",
	usage: "reload <commandname>"
};
