const {
	RichEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = (bot, member) => {
	const conf = bot.servConf.get(member.guild.id);
	const logchan = conf.logchannel;
	if (!logchan) {
		return;
	}
	const logchanid = logchan.slice(2, logchan.length - 1);
	const chan = member.guild.channels.get(logchanid);
	if (!chan) {
		return;
	}
	member.guild.fetchAuditLogs({
		type: "MEMBER_KICK",
		limit: 1
	}).then(audit => {
		let embed;
		const entry = audit.entries.first();
		// console.log(entry);
		const d = new Date();
		if (entry && entry.target.id === member.id && ((d - entry.createdAt) / 1000) <= 5) {
			console.log(`${member.displayName} was kicked from ${member.guild.name} server.`);
			embed = new RichEmbed()
				.setColor("#ff8300")
				.setAuthor(`${member.user.tag} (${(member.nickname)?`${member.nickname} - `:""}${member.user.id})`, member.user.avatarURL)
				.setDescription(`**Action:** Kick\n**Executor:** ${entry.executor.tag} (${entry.executor.id})\n**Reason:** ${(entry.reason)?entry.reason:"-"}`);
			return send(chan, "", embed);
		} else {
			member.guild.fetchAuditLogs({
				type: "MEMBER_BAN_ADD",
				limit: 1
			}).then(auditcheck => {
				const entrycheck = auditcheck.entries.first();
				if (entrycheck && entrycheck.target.id === member.id && ((d - entrycheck.createdAt) / 1000) <= 5) {
					return;
				}
				console.log(`${member.displayName} left ${member.guild.name} server.`);
				embed = new RichEmbed()
					.setColor("#f4bf42")
					.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.avatarURL)
					.setFooter("User left");
				return send(chan, "", embed);
			}).catch(console.error);
		}
	}).catch(console.error);
};
