const {
	MessageEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = async (bot, member) => {
	if (member.partial) {
		try {
			member = await member.fetch();
		} catch (e) {
			console.error(e);
			return;
		}
	}
	console.log(`${member.displayName} joined ${member.guild.name} server.`);
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
	const embed = new MessageEmbed()
		.setColor("#80f31f")
		.setAuthor({
			name: `${member.user.tag} (${member.user.id})`,
			iconURL: member.user.displayAvatarURL()
		})
		.setDescription(`${member.user}`)
		.setFooter({
			text: "User joined"
		})
		.setTimestamp();
	await send(chan, {
		content: "\u200b",
		embeds: [embed]
	});
};
