const colors = require("colors");

module.exports = (bot, oldMember, newMember) => {
	const guild = newMember.guild;
	let playRole = "";
	if (guild.id === "83078957620002816" || guild.id === "211599888222257152") {
		playRole = guild.roles.find("name", "Playing Distance");
	}
	if (!playRole || playRole === "") {
		return;
	}
	//console.log("playRole.name", playRole.name);
	const botMember = guild.members.get(bot.user.id);
	if ((botMember.hasPermission("MANAGE_ROLES") || botMember.hasPermission(10000000)) && botMember.highestRole.position > newMember.highestRole.position) {
		const memberName = newMember.displayName;
		//console.log("newMember.user.presence.game", newMember.user.presence.game);
		if (newMember.user.presence.game && newMember.user.presence.game.name === "Distance") {
			newMember.addRole(playRole).then(console.log(colors.white.dim(`* ${memberName} added to ${playRole.name} role on ${guild.name} server.`))).catch(console.error);
		} else if (!newMember.user.presence.game && newMember.roles.has(playRole.id)) {
			newMember.removeRole(playRole).then(console.log(colors.white.dim(`* ${memberName} removed from ${playRole.name} role on ${guild.name} server.`))).catch(console.error);
		} else if ((newMember.user.presence.game && newMember.user.presence.game !== "Distance") && newMember.roles.has(playRole.id)) {
			newMember.removeRole(playRole).then(console.log(colors.white.dim(`* ${memberName} removed from ${playRole.name} role on ${guild.name} server.`))).catch(console.error);
		}
	}
};
