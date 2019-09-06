const cl = require("../util/chatinfo.js");
const {
	RichEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = (bot, oldMember, newMember) => {
	if (!oldMember || !newMember || !oldMember.displayName || !newMember.displayName) {
		return;
	}
	if (oldMember.displayName !== newMember.displayName && !newMember.user.bot) {
		cl.writeLineToAllLogs(bot, newMember.guild, `${oldMember.displayName} is now known as ${newMember.displayName}`);

		const conf = bot.servConf.get(newMember.guild.id);
		const logchan = conf.logchannel;
		if (!logchan) {
			return;
		}
		const logchanid = logchan.slice(2, logchan.length - 1);
		const chan = newMember.guild.channels.get(logchanid);
		if (!chan) {
			return;
		}
		const embed = new RichEmbed()
			.setColor("#ffff00")
			.setAuthor(`${newMember.user.tag} (${newMember.user.id})`, newMember.user.avatarURL)
			.setDescription(`**Action:** Nickname Change\n**Change:** \`${oldMember.displayName}\` → \`${newMember.displayName}\``);
		send(chan, "", embed);
	}
};
