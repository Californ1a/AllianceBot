const {
	RichEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = (bot, guild, user) => {
	const conf = bot.servConf.get(guild.id);
	const logchan = conf.logchannel;
	if (!logchan) {
		return;
	}
	const logchanid = logchan.slice(2, logchan.length - 1);
	const chan = guild.channels.get(logchanid);
	if (!chan) {
		return;
	}
	guild.fetchAuditLogs({
		type: "MEMBER_BAN_ADD",
		limit: 1
	}).then(audit => {
		const entry = audit.entries.first();
		const d = new Date();
		const executor = guild.members.get(entry.executor.id);
		let executorEntry = "";
		if (!executor) {
			executorEntry = `${entry.executor.tag} (${entry.executor.id})`;
		} else {
			executorEntry = `${executor.user.tag} (${(executor.nickname)?`${executor.nickname} - `:""}${executor.user.id})`;
		}
		if (entry && entry.target.id === user.id && ((d - entry.createdAt) / 1000) <= 5) {
			console.log(`${entry.target.tag} banned from guild \`${guild.name}\` for reason: ${entry.reason}.`);
			const embed = new RichEmbed()
				.setColor("#ff1900")
				.setAuthor(`${entry.target.tag} (${entry.target.id})`, entry.target.avatarURL)
				.setDescription(`**Action:** Ban\n**Executor:** ${executorEntry}\n**Reason:** ${(entry.reason)?entry.reason:"-"}`);
			send(chan, "", embed);
		}
	}).catch(console.error);





	guild.fetchBan(user).then((ban) => {
		console.log(`${ban.user.tag} banned from guild \`${guild.name}\` for reason: ${ban.reason}.`);
		const embed = new RichEmbed()
			.setColor("#ff1900")
			.setAuthor(`${ban.user.tag} (${ban.user.id})`, ban.user.avatarURL)
			.setDescription(`**Action:** Ban\n**Reason:** ${ban.reason}`);
		send(chan, "", embed);
	}).catch(console.error);
};
