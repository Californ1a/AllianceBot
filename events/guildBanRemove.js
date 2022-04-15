const {
	MessageEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = async (bot, ban) => {
	if (ban.partial) {
		try {
			ban = await ban.fetch();
		} catch (e) {
			console.error(e);
			return;
		}
	}
	const {
		guild,
		user
	} = ban;
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
			type: "MEMBER_BAN_REMOVE",
			limit: 1
		});
		const entry = audit.entries.first();
		const d = new Date();

		if (!(entry && entry.target.id === user.id && ((d - entry.createdAt) / 1000) <= 5)) {
			return;
		}
		console.log(`${entry.target.tag} unbanned from guild \`${guild.name}\`.`);
		const embed = new MessageEmbed()
			.setColor("#80f31f")
			.setAuthor({
				name: `${entry.target.tag} (${entry.target.id})`,
				iconURL: entry.target.displayAvatarURL()
			})
			.setDescription(`${entry.target}\n\n**Action:** Unban\n**Executor:** ${entry.executor}`)
			.setTimestamp();
		await send(chan, {
			content: "\u200b",
			embeds: [embed]
		});
	} catch (e) {
		console.error(e);
	}
};
