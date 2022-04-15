const colors = require("colors");
const connection = require("../util/connection.js");

const addServer = async (bot, guild) => {
	console.log(colors.red(`Does not exist, trying to insert server '${guild.name}' into database...`));
	const owner = await guild.fetchOwner();
	const info = {
		servername: `'${guild.name}'`,
		serverid: guild.id,
		ownerid: owner.id,
		prefix: "!"
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

module.exports = (bot, guild) => {
	console.log(colors.red(`Joined server '${guild.name}' - Checking if exists...`));
	connection.select("*", "servers", `serverid='${guild.id}'`).then(r => {
		if (!r[0]) {
			addServer(bot, guild);
		} else {
			console.log(colors.yellow(`Server '${guild.name}' already exists.`));
		}
	}).catch(e => console.error(e));
};
