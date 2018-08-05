const canAssignRole = require("../util/canAssignRole.js");

module.exports = (bot, member) => {
	console.log(`${member.displayName} joined ${member.guild.name} server.`);
	const conf = bot.servConf.get(member.guild.id);
	const botMember = member.guild.members.get(bot.user.id);
	const toRole = (conf.timeoutrole) ? member.guild.roles.find("name", conf.timeoutrole) : member.guild.roles.find("name", "Timeout");
	if (!toRole || !canAssignRole(botMember, member)) {
		return;
	}
	if (bot.timer.get(member.id) && !member.roles.get(toRole.id)) {
		member.addRole(toRole);
		console.log(`${member.displayName} re-added to timeout in ${member.guild.name} server.`);
	}
};
