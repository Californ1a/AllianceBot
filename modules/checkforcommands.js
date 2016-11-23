const prefix = require("../config/options.json").prefix;
const cmds = require("./commands.js");

var checkForCommands = function(message, results, connection, http, bot) {
	let command = results[0].slice(prefix.length);
	if (command === "addcomtoserv") {
		cmds.addcomtoserv(message, results, connection);
	} else if (command === "remcomfromserv") {
		cmds.delcomfromserv(message, results, connection);
	} else if (command === "newcom") {
		cmds.newcom(message, results, connection);
	} else if (command === "delcom") {
		cmds.delcom(message, results, connection);
	} else if (command === "test") {
		cmds.test(message, results, connection);
	} else if (command === "dist") {
		cmds.dist(message, results, connection, http);
	} else if (command === "wr") {
		cmds.wr(message, results, connection, http);
	} else if (command === "ss") {
		cmds.ss(message, results, connection);
	} else if (command === "advent") {
		cmds.advent(message, results, connection);
	} else if (command === "speedy") {
		cmds.speedy(message, results, connection);
	} else if (command === "commands" || command === "cmds" || command === "help") {
		cmds.help(message, results, connection);
	} else if (command === "role") {
		cmds.role(bot, message, results, connection);
	} else if (command === "win" || command === "rip" || command === "tf") {
		cmds.ripwin(message, results, connection);
	} else if (command === "uptime") {
		cmds.uptime(message, results, connection);
	}
};

module.exports = {
	checkForCommands
};
