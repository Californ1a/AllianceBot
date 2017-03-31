const colors = require("colors");
const connection = require("../util/connection.js");

module.exports = (bot, guild) => {
	console.log(colors.red(`Trying to insert server '${guild.name}' into database.`));
	var info = {
		"servername": `'${guild.name}'`,
		"serverid": guild.id,
		"ownerid": guild.owner.id,
		"prefix": "!"
	};
	connection.insert("servers", info).then(() => {
		console.log(colors.red("Successfully inserted server."));
	}).catch(e => console.error(e.stack));
};
