const editPlayRole = require("../util/editRole.js");
const send = require("../util/sendMessage.js");

const runCheck = (memb, role, guild) => {
	const P = memb.user.presence;

	const hasStream = (P.game) ? P.game.streaming : false;
	const hasDistance = (P.game) ? (hasStream) ? /Distance/i.test(P.game.details) : /Distance/i.test(P.game.name) : false;
	const hasRole = memb.roles.has(role.id);

	if (hasDistance && !hasRole) {
		editPlayRole("add", memb, role, guild);
	} else if (!hasDistance && hasRole) {
		editPlayRole("del", memb, role, guild);
	} else if (hasDistance && !hasRole) {
		editPlayRole("add", memb, role, guild);
	}
};

exports.run = (bot, msg, args, perm) => {
	const member = msg.member;
	const guild = member.guild;
	if (guild.id === "83078957620002816") {
		const botMember = guild.members.get(bot.user.id);
		if ((botMember.hasPermission("MANAGE_ROLES") || botMember.hasPermission(10000000)) && botMember.highestRole.position > member.highestRole.position) {
			const playRole = guild.roles.find(val => val.name === "Playing Distance");
			if (!playRole) {
				return;
			}
			if (perm >= 2 && args[0] === "all") {
				guild.members.forEach(m => {
					runCheck(m, playRole, guild);
				});
			} else {
				runCheck(member, playRole, guild);
				send(msg.channel, "Note that custom status overrides your game in the Discord api. If you don't have a custom status set, and your role wasn't updated, restart Discord.");
			}
		}
	}
};

exports.conf = {
	guildOnly: true,
	aliases: ["cr"],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "checkrole",
	description: "Manually check if you should be added to or removed from the \"Playing Game\" role if the bot didn't automatically detect a game change.",
	extendedDescription: "",
	usage: "checkrole"
};
