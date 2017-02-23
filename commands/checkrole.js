const colors = require("colors");

exports.run = (bot, msg) => {
	let member = msg.member;
	let guild = member.guild;
	if (guild.id === "83078957620002816") {
		let botMember = guild.members.get(bot.user.id);
		if (botMember.hasPermission(10000000) && botMember.highestRole.position > member.highestRole.position) {
			let playRole = guild.roles.find("name", `Playing ${guild.name}`);
			if (!playRole) {
				return;
			}
			if (member.user.presence.game && member.user.presence.game.name === guild.name) {
				member.addRole(playRole).then(() => {
					console.log(colors.white.dim(`* ${member.displayName}  added to ${playRole.name} role on ${guild.name} server.`));
				}).catch(e => console.error(e.stack));
			} else if (!member.user.presence.game && member.roles.has(playRole.id)) {
				member.removeRole(playRole).then(() => {
					console.log(colors.white.dim(`* ${member.displayName} removed from ${playRole.name} role on ${guild.name} server.`));
				}).catch(e => console.error(e.stack));
			} else if ((member.user.presence.game && member.user.presence.game !== "Distance") && member.roles.has(playRole.id)) {
				member.removeRole(playRole).then(() => {
					console.log(colors.white.dim(`* ${member.displayName} removed from ${playRole.name} role on ${guild.name} server.`));
				}).catch(console.error);
			}
		}
	}
};

exports.conf = {
	guildOnly: false,
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
