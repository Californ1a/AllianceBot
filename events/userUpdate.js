const cl = require("../util/chatinfo.js");

module.exports = (bot, oldUser, newUser) => {
	if (oldUser.username !== newUser.username && !newUser.bot) {
		bot.guilds.forEach(guild => {
			const guildMember = guild.members.get(newUser.id);
			if (guildMember && guildMember.displayName && guildMember.displayName === newUser.username) {
				cl.writeLineToAllLogs(bot, guildMember.guild, `${oldUser.username} is now known as ${newUser.username}`);
			}
		});
	}
};
