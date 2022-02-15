const canAssignRole = require("../util/canAssignRole.js");
const {
	MessageEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = (bot, member) => {
	console.log(`${member.displayName} joined ${member.guild.name} server.`);
	const conf = bot.servConf.get(member.guild.id);
	const botMember = member.guild.members.cache.get(bot.user.id);
	const toRole = (conf.timeoutrole) ? member.guild.roles.cache.find(val => val.name === conf.timeoutrole) : member.guild.roles.cache.find(val => val.name === "Timeout");
	if (!toRole || !canAssignRole(botMember, member)) {
		return;
	}
	if (bot.timer.get(member.id) && !member.roles.cache.get(toRole.id)) {
		member.roles.add(toRole);
		console.log(`${member.displayName} re-added to timeout in ${member.guild.name} server.`);
	}


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
		.setDescription(member.user)
		.setFooter({
			text: "User joined"
		})
		.setTimestamp();
	send(chan, {
		content: "\u200b",
		embeds: [embed]
	});
};
