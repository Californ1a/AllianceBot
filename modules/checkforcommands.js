var prefix = require("../config/options.json").prefix;
var cmds = require("./commands.js");

var checkForCommands = function(message, results, connection, http, bot) {
	if (message.content.startsWith(prefix + "addcomtoserv")) {
		cmds.addcomtoserv(message, results, connection);
	} else if (message.content.startsWith(prefix + "remcomfromserv")) {
		cmds.delcomfromserv(message, results, connection);
	} else if (message.content.startsWith(prefix + "newcom")) {
		cmds.newcom(message, results, connection);
	} else if (message.content.startsWith(prefix + "delcom")) {
		cmds.delcom(message, results, connection);
	} else if (message.content.startsWith(prefix + "test")) {
		cmds.test(message, results, connection);
	} else if (message.content.startsWith(prefix + "dist")) {
		cmds.dist(message, results, connection, http);
	} else if (message.content.startsWith(prefix + "wr")) {
		cmds.wr(message, results, connection, http);
	} else if (message.content.startsWith(prefix + "ss")) {
		cmds.ss(message, results, connection);
	} else if (message.content.startsWith(prefix + "advent")) {
		cmds.advent(message, results, connection);
	} else if (message.content.startsWith(prefix + "speedy")) {
		cmds.speedy(message, results, connection);
	} else if (message.content.startsWith(prefix + "commands") || message.content.startsWith(prefix + "cmds") || message.content.startsWith(prefix + "help")) {
		cmds.help(message, results, connection);
	} else if (message.content.startsWith(prefix + "role")) {
		cmds.role(bot, message, results, connection);
	} else if (message.content.startsWith(prefix + "win") || message.content.startsWith(prefix + "rip") || message.content.startsWith(prefix + "tf")) {
		cmds.ripwin(message, results, connection);
	}
};

module.exports = {
	checkForCommands
};
