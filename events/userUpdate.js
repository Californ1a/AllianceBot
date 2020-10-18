const cl = require("../util/chatinfo.js");
const {
	MessageEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = (bot, oldUser, newUser) => {
	if (!(oldUser.username !== newUser.username && !newUser.bot)) {
		return;
	}
	bot.guilds.cache.forEach(guild => {
		const guildMember = guild.members.cache.get(newUser.id);
		if (!(guildMember && guildMember.displayName && guildMember.displayName === newUser.username)) {
			return;
		}
		cl.writeLineToAllLogs(bot, guildMember.guild, `${oldUser.username} is now known as ${newUser.username}`);

		const conf = bot.servConf.get(guildMember.guild.id);
		const logchan = conf.logchannel;
		if (!logchan) {
			return;
		}
		const logchanid = logchan.slice(2, logchan.length - 1);
		const chan = guildMember.guild.channels.cache.get(logchanid);
		if (!chan) {
			return;
		}
		const embed = new MessageEmbed()
			.setColor("#2f3136")
			.setAuthor(`${guildMember.user.tag} (${guildMember.user.id})`, guildMember.user.displayAvatarURL())
			.setDescription(`${guildMember.user}\n\n**Action:** Username Change\n**Change:** \`${oldUser.username.replace("`", "\\`")}\` → \`${guildMember.displayName.replace("`", "\\`")}\``)
			.setTimestamp();
		send(chan, "", embed);
	});
};
