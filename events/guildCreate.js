const colors = require("colors");
const connection = require("../util/connection.js");

module.exports = (bot, guild) => {
	console.log(colors.red(`Trying to insert server '${guild.name}' into database...`));
	var info = {
		"servername": `'${guild.name}'`,
		"serverid": guild.id,
		"ownerid": guild.owner.id,
		"prefix": "!"
	};
	connection.insert("servers", info).then(() => {
		console.log(colors.red("Success. Inserting default commands for new server..."));
	}).then(() => {
		connection.query(`INSERT INTO commands (commandname, server_id) VALUES ('config' ,${guild.id}), ('delcom', ${guild.id}), ('editcom', ${guild.id}), ('help', ${guild.id}), ('newcom', ${guild.id}), ('uptime', ${guild.id}), ('hype', ${guild.id})`).then(() => {
			console.log(colors.red("Success. Refreshing server config cache..."));
			bot.confRefresh().then(() => {
				console.log(colors.red("Success."));
			});
		}).catch(e => console.error(e.stack));
	}).catch(e => console.error(e.stack));
};
