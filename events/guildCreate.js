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
	console.log(colors.red(`Trying to insert win quotes for server '${guild.name}'.`));
	connection.query(`INSERT INTO win (server_id, quote) SELECT "113151199963783168", quote FROM win WHERE server_id="${guild.id}"`).then(() => {
		console.log(colors.red("Successfully inserted win quotes."));
	}).catch(e => console.error(e.stack));
	console.log(colors.red(`Trying to insert rip quotes for server '${guild.name}'.`));
	connection.query(`INSERT INTO rip (server_id, quote) SELECT "113151199963783168", quote FROM win WHERE server_id="${guild.id}"`).then(() => {
		console.log(colors.red("Successfully inserted win quotes."));
	}).catch(e => console.error(e.stack));
};
