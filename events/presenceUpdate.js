const editPlayRole = require("../util/editRole.js");

module.exports = (bot, oldPresence, newPresence) => {
	const member = newPresence.member;
	const guild = member.guild;
	let playRole = "";
	if (guild.id === "83078957620002816" || guild.id === "211599888222257152") {
		playRole = guild.roles.cache.find(val => val.name === "Playing Distance");
	}
	if (!playRole || playRole === "") {
		return;
	}

	const botMember = guild.members.cache.get(bot.user.id);
	if ((botMember.hasPermission("MANAGE_ROLES") || botMember.hasPermission(10000000)) && botMember.roles.highest.position > member.roles.highest.position) {

		const oldP = (oldPresence && oldPresence.activities) ? oldPresence.activities.find(a => a.name === "Distance") : false;
		const newP = newPresence.activities.find(a => a.name === "Distance");

		const oldHasStream = (oldP) ? oldP.streaming : false;
		const oldHasDistance = (oldP) ? (oldHasStream) ? /Distance/i.test(oldP.state) : (oldP.applicationID) ? /Distance/i.test(oldP.name) : false : false;
		//const oldHasRole = oldMember.roles.cache.has(playRole.id);

		const newHasStream = (newP) ? newP.streaming : false;
		const newHasDistance = (newP) ? (newHasStream) ? /Distance/i.test(newP.state) : (newP.applicationID) ? /Distance/i.test(newP.name) : false : false;
		const newHasRole = member.roles.cache.has(playRole.id);

		if (newHasDistance && !newHasRole) {
			editPlayRole("add", member, playRole, guild);
		} else if (!newHasDistance && newHasRole) {
			editPlayRole("del", member, playRole, guild);
		} else if (!oldHasDistance && newHasDistance) {
			editPlayRole("add", member, playRole, guild);
		} else if (newHasDistance && !newHasRole) {
			editPlayRole("add", member, playRole, guild);
		}

	}
};
