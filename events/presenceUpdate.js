const colors = require("colors");

const editPlayRole = (type, memb, role, guild) => {
	if (type === "add") {
		memb.addRole(role).then(console.log(colors.white.dim(`* ${memb.displayName} added to ${role.name} role on ${guild.name} server.`))).catch(console.error);
	} else if (type === "del") {
		memb.removeRole(role).then(console.log(colors.white.dim(`* ${memb.displayName} removed from ${role.name} role on ${guild.name} server.`))).catch(console.error);
	}
};

module.exports = (bot, oldMember, newMember) => {
	const guild = newMember.guild;
	let playRole = "";
	if (guild.id === "83078957620002816" || guild.id === "211599888222257152") {
		playRole = guild.roles.find(val => val.name === "Playing Distance");
	}
	if (!playRole || playRole === "") {
		return;
	}
	//console.log("playRole.name", playRole.name);
	const botMember = guild.members.get(bot.user.id);
	if ((botMember.hasPermission("MANAGE_ROLES") || botMember.hasPermission(10000000)) && botMember.highestRole.position > newMember.highestRole.position) {
		//const memberName = newMember.displayName;
		//console.log("newMember.user.presence.game", newMember.user.presence.game);
		const oldP = oldMember.user.presence;
		const newP = newMember.user.presence;

		if (oldP.game && oldP.game.name === "Distance" && newP.game && newP.game.name === "Distance") {
			return;
		} else if (oldP.game && oldP.game.name !== "Distance" && newP.game && newP.game.name === "Distance") {
			editPlayRole("add", newMember, playRole, guild);
		} else if (!oldP.game && newP.game && newP.game.name === "Distance") {
			editPlayRole("add", newMember, playRole, guild);
		} else if (!newP.game && newMember.roles.has(playRole.id)) {
			editPlayRole("del", newMember, playRole, guild);
		} else if ((newP.game && newP.game !== "Distance") && newMember.roles.has(playRole.id)) {
			editPlayRole("del", newMember, playRole, guild);
		}

	}
};
