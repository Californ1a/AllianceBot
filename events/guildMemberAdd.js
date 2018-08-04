const canAssignRole = require("../util/canAssignRole.js");

module.exports = (bot, member) => {
	const conf = bot.servConf.get(member.guild.id);
	const botMember = member.guild.members.get(bot.user.id);
	const toRole = (conf.timeoutrole) ? member.guild.roles.find("name", conf.timeoutrole) : member.guild.roles.find("name", "Timeout");
	if (!toRole || !canAssignRole(botMember, member)) {
		return;
	}
	if (bot.timer.get(member.id) && !member.roles.find("name", toRole)) {
		member.addRole(toRole);
	}
};
