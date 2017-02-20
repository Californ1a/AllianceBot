const colors = require("colors");
const pre = require("../config.json").prefix;

module.exports = bot => {
	console.log(colors.red(`Bot online and ready on ${bot.guilds.size} ${(bot.guilds.size > 2) ? "servers" : "server"}.`));
	bot.user.setStatus("online").catch(e => console.error(e.stack));
	bot.user.setGame(`Distance | ${pre}help`).catch(e => console.error(e.stack));
};
