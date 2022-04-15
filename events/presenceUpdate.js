const {
	Permissions
} = require("discord.js");
const editPlayRole = require("../util/editRole.js");

module.exports = async (bot, oldPresence, newPresence) => {
	let member = newPresence.member;
	const guild = newPresence.guild || member?.guild;
	if (!guild) {
		return;
	}
	if (!member && guild) {
		member = await guild.members.fetch(newPresence.userId);
	}
	let playRole = "";
	if (guild.id === "83078957620002816" || guild.id === "211599888222257152") {
		playRole = guild.roles.cache.find(val => val.name === "Playing Distance");
	}
	if (!playRole || playRole === "") {
		return;
	}

	const botMember = guild.members.cache.get(bot.user.id);
	if ((botMember.permissions.has(Permissions.FLAGS.MANAGE_ROLES) || botMember.permissions.has(10000000n)) && botMember.roles.highest.position > member.roles.highest.position) {

		const regex = /^Distance$/i;

		const oldP = (oldPresence && oldPresence.activities) ? oldPresence.activities.find(a => regex.test(a.name)) : false;
		const newP = newPresence.activities.find(a => regex.test(a.name));

		const oldHasStream = (oldP) ? oldP.type === "STREAMING" : false;
		const oldHasDistance = (oldP) ? (oldHasStream) ? regex.test(oldP.state) : (oldP.applicationId) ? regex.test(oldP.name) : false : false;
		//const oldHasRole = oldMember.roles.cache.has(playRole.id);

		const newHasStream = (newP) ? newP.type === "STREAMING" : false;
		const newHasDistance = (newP) ? (newHasStream) ? regex.test(newP.state) : (newP.applicationId) ? regex.test(newP.name) : false : false;
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
