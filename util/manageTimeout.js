const colors = require("colors");
const connection = require("./connection.js");

function manageTimeout(mentionedMember, bot, toRole, guildid) {
	const guild = bot.guilds.get(guildid);
	if (mentionedMember) {
		if (guild.members.get(mentionedMember.id)) {
			mentionedMember.removeRole(toRole).catch(e => console.error(e.stack));
			console.log(colors.red(`${mentionedMember.displayName} removed from timeout.`));
		} else {
			console.log(colors.red(`When attempting to remove Timeout role, ${mentionedMember.displayName} could not be found.`));
		}
	} else {
		console.log(colors.red("When attempting to remove Timeout role, the member could not be found on the server anymore."));
	}
	connection.del("timeout", `memberid=${mentionedMember.id} AND server_id=${guild.id}`).catch(console.error);
}

module.exports = manageTimeout;
