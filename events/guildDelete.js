const colors = require("colors");
const connection = require("../util/connection.js");

module.exports = (bot, guild) => {
	if (guild.available) { //ensure kick rather than server outtage
		console.log(colors.red(`Attempting to remove ${guild.name} from the database.`));
		connection.del("servers", `serverid='${guild.id}'`).then(() => {
			console.log(colors.red("Successfully removed server."));
		}).catch(e => console.error(e.stack));
	}
};
