const colors = require("colors");

module.exports = async (bot, interaction) => {
	if (!interaction.isCommand()) {
		return;
	}
	const cmd = bot.commands.get(interaction.commandName);
	if (cmd) {
		console.log(colors.grey(`* ${interaction.member.displayName} used command /${interaction.commandName}`));
		cmd.runSlash(bot, interaction);
	}
};
