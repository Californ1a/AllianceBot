const colors = require("colors");

module.exports = (bot, oldMember, newMember) => {
	let guild = newMember.guild;
	var playRole = "";
	if (guild.id === "83078957620002816") {
		playRole = guild.roles.find("name", "Playing Distance");
	} else if (playRole === "") {
		return;
	}
	let botMember = guild.members.get(bot.user.id);
	if (botMember.hasPermission(10000000) && botMember.highestRole.position > newMember.highestRole.position) {
		let memberName = newMember.displayName;

		if (newMember.user.presence.game && newMember.user.presence.game.name === "Distance") {
			newMember.addRole(playRole).then(console.log(colors.white.dim(`* ${memberName} added to ${playRole.name} role on ${guild.name} server.`))).catch(console.error);
		} else if (!newMember.user.presence.game && newMember.roles.has(playRole.id)) {
			newMember.removeRole(playRole).then(console.log(colors.white.dim(`* ${memberName} removed from ${playRole.name} role on ${guild.name} server.`))).catch(console.error);
		} else if ((newMember.user.presence.game && newMember.user.presence.game !== "Distance") && newMember.roles.has(playRole.id)) {
			newMember.removeRole(playRole).then(console.log(colors.white.dim(`* ${memberName} removed from ${playRole.name} role on ${guild.name} server.`))).catch(console.error);
		}
	}
};
