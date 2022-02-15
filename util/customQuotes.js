const colors = require("colors");
const escape = require("../util/escapeChars.js");
const connection = require("./connection.js");
const s = require("./sendMessage.js");
const pre = require("../config.json").prefix;
require("./Array.prototype.rejoin.js");

async function send(msg, location, content, type) {
	if (msg.type === "APPLICATION_COMMAND") {
		if (type === "dm") {
			await s(msg.user, content);
		} else if (type === "editreply") {
			await msg.editReply({
				content,
				ephemeral: true
			});
		} else {
			await msg.reply(content);
		}
	} else {
		await s(location, content);
	}
}

function recombineQuote(args) {
	return args.slice(1).join(" ");
}

async function randomQuote(message, type) {
	try {
		const response = await connection.select("quote", type, `server_id=${message.channel.guild.id} ORDER BY RAND() LIMIT 1`);
		if (!response[0]) {
			await send(message, message.channel, "None found.");
		} else {
			await send(message, message.channel, response[0].quote);
		}
	} catch (e) {
		console.error(e.stack);
		return;
	}
}

async function addQuote(msg, args, type) {
	let recombined = "";
	if (args.length >= 2) {
		recombined = recombineQuote(args);
		console.log(colors.red(`Trying to insert ${type} message '${recombined}' into database.`));
		const info = {
			"quote": recombined,
			"server_id": msg.channel.guild.id
		};
		try {
			await connection.insert(type, info);
			console.log(colors.red(`Successfully inserted ${type} message.`));
			await send(msg, msg.channel, "Success");
		} catch (e) {
			await send(msg, msg.channel, "Failed");
			console.error(e.stack);
			return;
		}
	} else {
		await send(msg, msg.channel, `Incorrect syntax. Use \`${pre}help ${type}\` for help.`);
	}
}

async function delQuote(msg, args, type) {
	let recombined = "";
	if (args.length >= 2) {
		//console.log(results.length);
		recombined = recombineQuote(args);
		console.log(colors.red("Attempting to remove " + type + " message '" + recombined + "' from the database."));
		try {
			await connection.del(type, `quote = '${recombined}' AND server_id=${msg.channel.guild.id}`);
			console.log(colors.red("Successfully removed " + type + " message."));
			await send(msg, msg.channel, "Success");
		} catch (e) {
			console.error(e.stack);
			return;
		}
	} else {
		await send(msg, msg.channel, `Incorrect syntax. Use \`${pre}help ${type}\` for help.`);
	}
}

async function listQuotes(msg, type) {
	if (msg.type === "APPLICATION_COMMAND") {
		await msg.reply({
			content: "Sending list to your DMs...",
			ephemeral: true
		});
	}
	console.log(colors.red(`Attempting to get full ${type} list.`));
	try {
		const response = await connection.select("quote", type, `server_id=${msg.channel.guild.id} order by lower(quote) asc`);
		if (!response[0]) {
			console.log(colors.red("Failed."));
			await send(msg, msg.author, `Failed to find any ${type} quotes for your server.`, "editreply");
			return;
		}
		console.log(colors.red("Success."));
		let quotespm = `\n**Here are all the current ${type} quotes:**\n--------------------\n\`\`\``;
		let lengthCheck;
		let i = 0;
		for (i; i < response.length; i++) {
			lengthCheck = `${quotespm}${response[i].quote}\r`;
			if (lengthCheck.length < 1996) {
				quotespm += `${response[i].quote}\r`;
			} else {
				quotespm += "```";
				await send(msg, msg.author, quotespm, "dm");
				quotespm = `\n**Remaining ${type} quotes:**\n--------------------\n\`\`\``;
				quotespm += `${response[i].quote}\r`;
			}
		}
		quotespm += "```";
		await send(msg, msg.author, quotespm, "dm");
		if (msg.type === "APPLICATION_COMMAND") {
			await msg.editReply({
				content: "Sent the list to your DMs.",
				ephemeral: true
			});
		}
	} catch (e) {
		await send(msg, msg.channel, "Failed to find any, with errors.", "editreply");
		console.error(e.stack);
		return;
	}
}

async function searchQuotes(msg, args, type) {
	//let args = message.content.split(" ").slice(1).join(" ");
	const searchKey = escape.chars(args.rejoin(" "));
	console.log(colors.red(`Trying to find ${type} message matching '${searchKey}' in database.`));
	try {
		const response = await connection.select("*", type, `server_id=${msg.channel.guild.id} AND quote LIKE '%${searchKey}%' COLLATE utf8mb4_unicode_ci ORDER BY RAND() LIMIT 1`);
		if (!response[0]) {
			console.log(colors.red("Failed to find any matching."));
			await send(msg, msg.channel, `Unable to find any ${type} quotes matching '${searchKey}'.`);
			return;
		}
		console.log(colors.red("Successfully found a quote."));
		await send(msg, msg.channel, response[0].quote);
	} catch (e) {
		await send(msg, msg.channel, "Failed to find any matching quotes, with errors.");
		console.error(e.stack);
		return;
	}
}

async function ripWin(msg, args, type, perm) {
	// var str = msg.content.toString();
	// var results = str.split(" ");
	if (!args[0]) { //if second word doesn't exist, type undefined
		await randomQuote(msg, type, connection);
	} else if (args[0] === "add" && perm >= 2) {
		await addQuote(msg, args, type);
	} else if (args[0] === "add") { //non-moderator
		await msg.reply(`You do not have permission to add new ${type} quotes.`);
	} else if (args[0] === "del" && perm >= 2) {
		await delQuote(msg, args, type);
	} else if (args[0] === "del") { //non-moderator
		await msg.reply(`You do not have permission to remove ${type} quotes.`);
	} else if (args[0] === "list") {
		await listQuotes(msg, type);
	} else {
		await searchQuotes(msg, args, type);
	}
	type = null;
}
//end ripwin command
module.exports = {
	ripWin
};
