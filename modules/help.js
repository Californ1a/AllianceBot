const prefix = require("../config/options.json").prefix;
const colors = require("colors");
var i = 0;

var help = function(connection, message, results) {
	var quotespm;
	var quotespm2;
	connection.query("SELECT commandname FROM commands WHERE server_id=" + message.guild.id + " order by commandname asc", function(error, quotes) {
		if (error) {
			message.channel.sendMessage("Failed to find any, with errors.");
			console.error(error);
			return;
		} else {
			if (typeof quotes[0] !== "object") {
				quotespm = "";
			}
			if (typeof quotes[0] === "object") {
				console.log(colors.red("Success."));
				if (!results[1]) {
					quotespm = "`" + prefix;
					i = 0;
					for (i; i < quotes.length; i++) {
						if (i === quotes.length - 1) {
							quotespm += quotes[i].commandname + "`";
						} else {
							quotespm += quotes[i].commandname + "`, `" + prefix;
						}
					}
				}
				connection.query("SELECT comname FROM servcom WHERE server_id=" + message.guild.id, function(error, quotes2) {
					if (error) {
						message.channel.sendMessage("Failed to find any, with errors.");
						console.error(error);
						return;
					} else {
						if (typeof quotes2[0] !== "object") {
							quotespm2 = "";
						} else {
							console.log(colors.red("Success."));
							quotespm2 = "`" + prefix;
							i = 0;
							for (i; i < quotes2.length; i++) {
								if (!(i === quotes2.length - 1)) {
									quotespm2 += quotes2[i].comname + "`, `" + prefix;
								} else {
									quotespm2 += quotes2[i].comname + "`";
								}
							}
							if (quotespm === "") {
								if (quotespm2) {
									message.author.sendMessage("No commands found for this server.");
								} else {
									message.author.sendMessage("Here are the main commands enabled for this server:\n" + quotespm);
								}
							} else if (quotespm2 === "") {
								message.author.sendMessage("Here are the custom commands for this server:\n" + quotespm2);
							} else {
								message.author.sendMessage("Here are the main commands enabled for this server:\n" + quotespm + "\n\nHere are the custom commands for this server:\n" + quotespm2);
							}
						}
					}
				});
			}
		}
	});
};



module.exports = {
	help
};
