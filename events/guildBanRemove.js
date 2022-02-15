const {
	MessageEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = (bot, guild, user) => {
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
	guild.fetchAuditLogs({
		type: "MEMBER_BAN_REMOVE",
		limit: 1
	}).then(audit => {
		const entry = audit.entries.first();
		const d = new Date();
		// const executor = guild.members.cache.get(entry.executor.id);
		// let executorEntry = "";
		// if (!executor) {
		// 	executorEntry = `${entry.executor.tag} (${entry.executor.id})`;
		// } else {
		// 	executorEntry = `${executor.user.tag} (${(executor.nickname)?`${executor.nickname} - `:""}${executor.user.id})`;
		// }
		if (entry && entry.target.id === user.id && ((d - entry.createdAt) / 1000) <= 5) {
			console.log(`${entry.target.tag} unbanned from guild \`${guild.name}\`.`);
			const embed = new MessageEmbed()
				.setColor("#80f31f")
				.setAuthor({
					name: `${entry.target.tag} (${entry.target.id})`,
					iconURL: entry.target.displayAvatarURL()
				})
				.setDescription(`${entry.target}\n\n**Action:** Unban\n**Executor:** ${entry.executor}`)
				.setTimestamp();
			send(chan, {
				content: "\u200b",
				embeds: [embed]
			});
		}
	}).catch(console.error);
};
