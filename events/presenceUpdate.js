const editPlayRole = require("../util/editRole.js");

module.exports = (bot, oldMember, newMember) => {
	const guild = newMember.guild;
	let playRole = "";
	if (guild.id === "83078957620002816" || guild.id === "211599888222257152") {
		playRole = guild.roles.find(val => val.name === "Playing Distance");
	}
	if (!playRole || playRole === "") {
		return;
	}

	const botMember = guild.members.get(bot.user.id);
	if ((botMember.hasPermission("MANAGE_ROLES") || botMember.hasPermission(10000000)) && botMember.highestRole.position > newMember.highestRole.position) {

		const oldP = oldMember.user.presence;
		const newP = newMember.user.presence;

		const oldHasStream = (oldP.game) ? oldP.game.streaming : false;
		const oldHasDistance = (oldP.game) ? (oldHasStream) ? /Distance/i.test(oldP.game.state) : (oldP.game.applicationID) ? /Distance/i.test(oldP.game.name) : false : false;
		//const oldHasRole = oldMember.roles.has(playRole.id);

		const newHasStream = (newP.game) ? newP.game.streaming : false;
		const newHasDistance = (newP.game) ? (newHasStream) ? /Distance/i.test(newP.game.state) : (newP.game.applicationID) ? /Distance/i.test(newP.game.name) : false : false;
		const newHasRole = newMember.roles.has(playRole.id);

		if (newHasDistance && !newHasRole) {
			editPlayRole("add", newMember, playRole, guild);
		} else if (!newHasDistance && newHasRole) {
			editPlayRole("del", newMember, playRole, guild);
		} else if (!oldHasDistance && newHasDistance) {
			editPlayRole("add", newMember, playRole, guild);
		} else if (newHasDistance && !newHasRole) {
			editPlayRole("add", newMember, playRole, guild);
		}

	}
};
