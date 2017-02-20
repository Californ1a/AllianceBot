const customQuotes = require("../util/customQuotes.js").ripWin;
const pre = require("../config.json").prefix;

exports.run = (bot, msg, args, perm) => {
	var type = "hype";
	customQuotes(msg, args, type, perm);
};

exports.conf = {
	guildOnly: false,
	aliases: [],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "hype",
	description: "Get random hype quotes, search for a hype quote, or add/delete hype quotes.",
	extendedDescription: `<key>\n* Supply a keyword to search for a specific quote.\n\n<list>\n* Obtain a complete list of all the quotes in PM.\n\n<add>\n* Insert the "quote" into the list of quotes.\n\n<del>\n* Remove the "quote" from the list of quotes.\n\n<quote>\n* The quote to be added to the list or removed from the list. For deletion, it must be an exact match. Use list and copy+paste from the full list (unless it contains emotes).\n\n= Examples =\n"${pre}hype nitro" :: Return a hype message matching "nitro".`,
	usage: "hype [<key>|list|add|del)] [<quote>]"
};
