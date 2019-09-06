const canAssignRole = require("../util/canAssignRole.js");
const {
	RichEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = (bot, member) => {
	console.log(`${member.displayName} joined ${member.guild.name} server.`);
	const conf = bot.servConf.get(member.guild.id);
	const botMember = member.guild.members.get(bot.user.id);
	const toRole = (conf.timeoutrole) ? member.guild.roles.find(val => val.name === conf.timeoutrole) : member.guild.roles.find(val => val.name === "Timeout");
	if (!toRole || !canAssignRole(botMember, member)) {
		return;
	}
	if (bot.timer.get(member.id) && !member.roles.get(toRole.id)) {
		member.addRole(toRole);
		console.log(`${member.displayName} re-added to timeout in ${member.guild.name} server.`);
	}


	const logchan = conf.logchannel;
	if (!logchan) {
		return;
	}
	const logchanid = logchan.slice(2, logchan.length - 1);
	const chan = member.guild.channels.get(logchanid);
	if (!chan) {
		return;
	}
	const embed = new RichEmbed()
		.setColor("#80f31f")
		.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.avatarURL)
		.setFooter("User joined");
	send(chan, "", embed);
};
