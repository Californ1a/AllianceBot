const colors = require("colors");
const distanceServers = require("../util/distanceServers.js");
const wrLog = require("../util/wrLog.js");
const checkLockdowns = require("../util/checkLockdowns.js");
const pre = require("../config.json").prefix;

module.exports = (bot) => {
	console.log(colors.red(`Bot online and ready on ${bot.guilds.cache.size} ${(bot.guilds.cache.size >= 2) ? "servers" : "server"}.`));
	bot.user.setPresence({
		status: "online",
		activities: [{
			name: `Distance | ${pre}help`,
			type: 0
		}]
	});
	if (bot.guilds.cache.get("83078957620002816")) {
		distanceServers(bot);
		wrLog(bot);
	}
	if (process.env.NODE_ENV === "dev" && bot.guilds.cache.get("211599888222257152")) {
		wrLog(bot);
	}
	checkLockdowns(bot);
	bot.confEventEmitter.emit("finishServConfLoad", 1);
	bot.loadSlashCommands();
};
