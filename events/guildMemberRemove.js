const {
	MessageEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");
const moment = require("moment");

module.exports = async (bot, member) => {
	const guild = member.guild;
	if (member.partial || !member.user) {
		// can't member.fetch() after they leave
		return;
	}
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
			type: "MEMBER_KICK",
			limit: 1
		});
		let embed;
		const entry = audit.entries.first();
		// console.log(entry);
		const d = new Date();
		const displayName = member.displayName || member.user.username;
		const tag = member.user.tag || `${member.user.username}#${member.user.discriminator}`;
		const nickname = member.nickname || "";
		if (entry && entry.target.id === member.user.id && ((d - entry.createdAt) / 1000) <= 5) {
			console.log(`${displayName} was kicked from ${guild.name} server.`);
			embed = new MessageEmbed()
				.setColor("#ff8300")
				.setAuthor({
					name: `${tag} (${nickname}${member.user.id})`,
					iconURL: member.user.displayAvatarURL()
				})
				.setDescription(`${member.user}\n\n**Action:** Kick\n**Executor:** ${entry.executor}\n**Reason:** ${(entry.reason)?entry.reason:"-"}`)
				.setTimestamp();
			return send(chan, {
				content: "\u200b",
				embeds: [embed]
			});
		} else {
			const auditcheck = await guild.fetchAuditLogs({
				type: "MEMBER_BAN_ADD",
				limit: 1
			});
			const entrycheck = auditcheck.entries.first();
			if (entrycheck && entrycheck.target.id === member.user.id && ((d - entrycheck.createdAt) / 1000) <= 5) {
				return;
			}
			console.log(`${displayName} left ${guild.name} server.`);
			const d2 = Date.now();
			const d3 = d2 - member.joinedTimestamp;
			const joinDuration = moment.duration(d3).humanize();

			embed = new MessageEmbed()
				.setColor("#f4bf42")
				.setAuthor({
					name: `${tag} (${member.user.id})`,
					iconURL: member.user.displayAvatarURL()
				})
				.setDescription(`${member.user}`)
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
