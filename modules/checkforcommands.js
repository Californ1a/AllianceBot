const prefix = require("../config/options.json").prefix;
const cmds = require("./commands.js");

var checkForCommands = function(message, results, connection, http, bot) {
	let command = results[0].slice(prefix.length).toLowerCase();
	if (command === "enable") {
		cmds.enable(message, results, connection);
	} else if (command === "disable") {
		cmds.disable(message, results, connection);
	} else if (command === "newcom") {
		cmds.newcom(message, results, connection);
	} else if (command === "editcom") {
		cmds.editcom(message, results, connection);
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
	} else if (command === "win" || command === "rip" || command === "tf" || command === "sign" || command === "hype") {
		cmds.ripwin(message, results, connection);
	} else if (command === "uptime") {
		cmds.uptime(message, results, connection);
	} else if (command === "checkrole") {
		cmds.checkrole(message, results, connection, bot);
	} else if (command === "strivia") {
		cmds.strivia(message, results, connection);
	} else if (command === "tscore") {
		cmds.tscore(message, results, connection);
	} else if (command === "num") {
		cmds.num(message, results, connection)
	}	else if (command === "evalu") {
		if (message.author.id !== "83264808022970368") {
			return;
		} else {
			cmds.evalu(message, bot);
		}
	}
};

module.exports = {
	checkForCommands
};
