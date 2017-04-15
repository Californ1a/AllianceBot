const colors = require("colors");
const escape = require("../util/escapeChars.js");
const connection = require("./connection.js");
const pre = require("../config.json").prefix;
require("./Array.prototype.rejoin.js");

function recombineQuote(args) {
	return args.slice(1).join(" ");
}

function randomQuote(message, type) {
	connection.select("quote", type, `server_id=${message.guild.id} ORDER BY RAND() LIMIT 1`).then(response => {
		if (!response[0]) {
			message.channel.sendMessage("None found.");
		} else {
			message.channel.sendMessage(response[0].quote);
		}
	}).catch(e => {
		console.error(e.stack);
		return;
	});
}

function addQuote(msg, args, type) {
	var recombined = "";
	if (args.length >= 2) {
		recombined = recombineQuote(args);
		console.log(colors.red(`Trying to insert ${type} message '${recombined}' into database.`));
		var info = {
			"quote": recombined,
			"server_id": msg.guild.id
		};
		connection.insert(type, info).then(() => {
			console.log(colors.red(`Successfully inserted ${type} message.`));
			msg.channel.sendMessage("Success");
		}).catch(e => {
			msg.channel.sendMessage("Failed");
			console.error(e.stack);
			return;
		});
	} else {
		msg.channel.sendMessage(`Incorrect syntax. Use \`${pre}help ${type}\` for help.`);
	}
}

function delQuote(msg, args, type) {
	var recombined = "";
	if (args.length >= 2) {
		//console.log(results.length);
		recombined = recombineQuote(args);
		console.log(colors.red("Attempting to remove " + type + " message '" + recombined + "' from the database."));
		connection.del(type, `quote = '${recombined}' AND server_id=${msg.guild.id}`).then(() => {
			console.log(colors.red("Successfully removed " + type + " message."));
			msg.channel.sendMessage("Success");
		}).catch(e => {
			console.error(e.stack);
			return;
		});
	} else {
		msg.channel.sendMessage(`Incorrect syntax. Use \`${pre}help ${type}\` for help.`);
	}
}

function listQuotes(msg, type) {
	console.log(colors.red(`Attempting to get full ${type} list.`));
	connection.select("quote", type, `server_id=${msg.guild.id} order by lower(quote) asc`).then(response => {
		if (!response[0]) {
			console.log(colors.red("Failed."));
			msg.author.sendMessage(`Failed to find any ${type} quotes for your server.`);
			return;
		}
		console.log(colors.red("Success."));
		var quotespm = `\n**Here are all the current ${type} quotes:**\n--------------------\n\`\`\``;
		var lengthCheck;
		var i = 0;
		for (i; i < response.length; i++) {
			lengthCheck = `${quotespm}${response[i].quote}\r`;
			if (lengthCheck.length < 1996) {
				quotespm += `${response[i].quote}\r`;
			} else {
				quotespm += "```";
				msg.author.sendMessage(quotespm);
				quotespm = `\n**Remaining ${type} quotes:**\n--------------------\n\`\`\``;
				quotespm += `${response[i].quote}\r`;
			}
		}
		quotespm += "```";
		msg.author.sendMessage(quotespm);
	}).catch(e => {
		msg.channel.sendMessage("Failed to find any, with errors.");
		console.error(e.stack);
		return;
	});
}

function searchQuotes(msg, args, type) {
	//let args = message.content.split(" ").slice(1).join(" ");
	let searchKey = escape.chars(args.rejoin(" "));
	console.log(colors.red(`Trying to find ${type} message matching '${searchKey}' in database.`));
	connection.select("*", type, `server_id=${msg.guild.id} AND quote LIKE '%${searchKey}%' COLLATE utf8mb4_unicode_ci ORDER BY RAND() LIMIT 1`).then(response => {
		if (!response[0]) {
			console.log(colors.red("Failed to find any matching."));
			msg.channel.sendMessage(`Unable to find any ${type} quotes matching '${searchKey}'.`);
			return;
		}
		console.log(colors.red("Successfully found a quote."));
		msg.channel.sendMessage(response[0].quote);
	}).catch(e => {
		msg.channel.sendMessage("Failed to find any matching quotes, with errors.");
		console.error(e.stack);
		return;
	});
}

var ripWin = function(msg, args, type, perm) {
	// var str = msg.content.toString();
	// var results = str.split(" ");
	if (!args[0]) { //if second word doesn't exist, type undefined
		randomQuote(msg, type, connection);
	} else if (args[0] === "add" && perm >= 2) {
		addQuote(msg, args, type);
	} else if (args[0] === "add") { //non-moderator
		msg.reply(`You do not have permission to add new ${type} quotes.`);
	} else if (args[0] === "del" && perm >= 2) {
		delQuote(msg, args, type);
	} else if (args[0] === "del") { //non-moderator
		msg.reply(`You do not have permission to remove ${type} quotes.`);
	} else if (args[0] === "list") {
		listQuotes(msg, type);
	} else {
		searchQuotes(msg, args, type);
	}
	type = null;
};
//end ripwin command
module.exports = {
	ripWin
};
