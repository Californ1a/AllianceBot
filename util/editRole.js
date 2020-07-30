const colors = require("colors");

module.exports = (type, memb, role, guild) => {
	if (type === "add") {
		memb.roles.add(role).then(console.log(colors.white.dim(`* ${memb.displayName} added to ${role.name} role on ${guild.name} server.`))).catch(console.error);
	} else if (type === "del") {
		memb.roles.remove(role).then(console.log(colors.white.dim(`* ${memb.displayName} removed from ${role.name} role on ${guild.name} server.`))).catch(console.error);
	}
};
