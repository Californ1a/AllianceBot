const {
	MessageEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = async (bot, guild, user) => {
	const conf = bot.servConf.get(guild.id);
	const logchan = conf.logchannel;
	if (!logchan) {
		return;
	}
	const logchanid = logchan.slice(2, logchan.length - 1);
	const chan = guild.channels.cache.get(logchanid);
	if (!chan) {
		return;
	}
	try {
		const audit = await guild.fetchAuditLogs({
			type: "MEMBER_BAN_ADD",
			limit: 1
		});
		const entry = audit.entries.first();
		const d = new Date();

		if (!(entry && entry.target.id === user.id && ((d - entry.createdAt) / 1000) <= 5)) {
			return;
		}
		console.log(`${entry.target.tag} banned from guild \`${guild.name}\` for reason: ${entry.reason}.`);
		const embed = new MessageEmbed()
			.setColor("#ff1900")
			.setAuthor({
				name: `${entry.target.tag} (${entry.target.id})`,
				iconURL: entry.target.displayAvatarURL()
			})
			.setDescription(`${entry.target}\n\n**Action:** Ban\n**Executor:** ${entry.executor}\n**Reason:** ${(entry.reason)?entry.reason:"-"}`)
			.setTimestamp();
		await send(chan, {
			content: "\u200b",
			embeds: [embed]
		});
	} catch (e) {
		console.error(e);
	}
};
