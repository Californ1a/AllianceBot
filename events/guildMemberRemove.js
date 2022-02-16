const {
	MessageEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");
const moment = require("moment");

module.exports = async (bot, member) => {
	if (member.partial) {
		try {
			member = await member.fetch();
		} catch (e) {
			console.error(e);
			return;
		}
	}
	const conf = bot.servConf.get(member.guild.id);
	const logchan = conf.logchannel;
	if (!logchan) {
		return;
	}
	const logchanid = logchan.slice(2, logchan.length - 1);
	const chan = member.guild.channels.cache.get(logchanid);
	if (!chan) {
		return;
	}
	try {
		const audit = await member.guild.fetchAuditLogs({
			type: "MEMBER_KICK",
			limit: 1
		});
		let embed;
		const entry = audit.entries.first();
		// console.log(entry);
		const d = new Date();
		if (entry && entry.target.id === member.id && ((d - entry.createdAt) / 1000) <= 5) {
			console.log(`${member.displayName} was kicked from ${member.guild.name} server.`);
			embed = new MessageEmbed()
				.setColor("#ff8300")
				.setAuthor({
					name: `${member.user.tag} (${(member.nickname)?`${member.nickname} - `:""}${member.user.id})`,
					iconURL: member.user.displayAvatarURL()
				})
				.setDescription(`${member.user}\n\n**Action:** Kick\n**Executor:** ${entry.executor}\n**Reason:** ${(entry.reason)?entry.reason:"-"}`)
				.setTimestamp();
			return send(chan, {
				content: "\u200b",
				embeds: [embed]
			});
		} else {
			const auditcheck = await member.guild.fetchAuditLogs({
				type: "MEMBER_BAN_ADD",
				limit: 1
			});
			const entrycheck = auditcheck.entries.first();
			if (entrycheck && entrycheck.target.id === member.id && ((d - entrycheck.createdAt) / 1000) <= 5) {
				return;
			}
			console.log(`${member.displayName} left ${member.guild.name} server.`);
			const d2 = Date.now();
			const d3 = d2 - member.joinedTimestamp;
			const joinDuration = moment.duration(d3).humanize();

			embed = new MessageEmbed()
				.setColor("#f4bf42")
				.setAuthor({
					name: `${member.user.tag} (${member.user.id})`,
					iconURL: member.user.displayAvatarURL()
				})
				.setDescription(member.user)
				.setFooter({
					text: `User left - ${(member.joinedTimestamp) ? `Joined ${joinDuration} ago` : "Unknown join date"}`
				})
				.setTimestamp();
			return send(chan, {
				content: "\u200b",
				embeds: [embed]
			});
		}
	} catch (e) {
		console.error(e);
	}
};
