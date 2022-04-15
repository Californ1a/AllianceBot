const cl = require("../util/chatinfo.js");
const {
	MessageEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = async (bot, oldMember, newMember) => {
	if (oldMember.partial) {
		return;
	}
	if (newMember.partial) {
		try {
			newMember = await newMember.fetch();
		} catch (e) {
			console.error(e);
			return;
		}
	}
	if (!oldMember || !newMember || !oldMember.displayName || !newMember.displayName) {
		return;
	}
	if (!(oldMember.displayName !== newMember.displayName && !newMember.user.bot)) {
		return;
	}
	cl.writeLineToAllLogs(bot, newMember.guild, `${oldMember.displayName} is now known as ${newMember.displayName}`);

	const conf = bot.servConf.get(newMember.guild.id);
	const logchan = conf.logchannel;
	if (!logchan) {
		return;
	}
	const logchanid = logchan.slice(2, logchan.length - 1);
	const chan = newMember.guild.channels.cache.get(logchanid);
	if (!chan) {
		return;
	}
	const embed = new MessageEmbed()
		.setColor("#ffff00")
		.setAuthor({
			name: `${newMember.user.tag} (${newMember.user.id})`,
			iconURL: newMember.user.displayAvatarURL()
		})
		.setDescription(`${newMember.user}\n\n**Action:** Nickname Change\n**Change:** \`${oldMember.displayName.replace("`", "\\`")}\` → \`${newMember.displayName.replace("`", "\\`")}\``)
		.setTimestamp();
	await send(chan, {
		content: "\u200b",
		embeds: [embed]
	});
};
