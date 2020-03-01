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

		const oldP = oldMember.user.presence.activities.find(a => a.name === "Distance");
		const newP = newMember.user.presence.activities.find(a => a.name === "Distance");

		const oldHasStream = (oldP) ? oldP.streaming : false;
		const oldHasDistance = (oldP) ? (oldHasStream) ? /Distance/i.test(oldP.state) : (oldP.applicationID) ? /Distance/i.test(oldP.name) : false : false;
		//const oldHasRole = oldMember.roles.has(playRole.id);

		const newHasStream = (newP) ? newP.streaming : false;
		const newHasDistance = (newP) ? (newHasStream) ? /Distance/i.test(newP.state) : (newP.applicationID) ? /Distance/i.test(newP.name) : false : false;
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
