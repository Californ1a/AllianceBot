const send = require("../util/sendMessage.js");

const del = (chan, m) => {
	chan.bulkDelete(m).then(() => {
		send(chan, `Purged ${(m.length) ? m.length : m} messages.`);
	}).catch(err => {
		send(chan, err.message);
		console.error(err);
	});
};

const doTheThing = (chan, amount, user) => {
	chan.messages.fetch().then(messages => {
		if (user) {
			const m = messages.filter(m => m.author.id === user.id).first(amount);
			del(chan, m);
		} else {
			const m = messages.filter(m => m.id !== messages.first().id).first(amount);
			del(chan, m);
		}
	}).catch(console.error);
};

exports.run = (bot, msg, args) => {
	const pre = bot.servConf.get(msg.guild.id).prefix;
	if (!args[0]) {
		return send(msg.channel, `Must specify an amount or an @mention and amount. Use \`${pre}help purge\` for help.`);
	} else if (((args[0] && isNaN(args[0]) && !msg.mentions.users.first()) || (!isNaN(args[0]) && parseInt(args[0]) < 1)) || (isNaN(args[0]) && !msg.mentions.users.first() && !args[1])) {
		return send(msg.channel, "First parameter must be a number >= 1 or an @mention.");
	} else if (args[0] && !isNaN(args[0]) && args[1]) {
		return send(msg.channel, `Incorrect syntax, use \`${pre}help purge\` for help.`);
	} else if (args[0] && !isNaN(args[0]) && !args[1]) {

		doTheThing(msg.channel, parseInt(args[0]));

	} else if (msg.mentions.users.first() && !args[1]) {
		return send(msg.channel, "You must specify an amount.");
	} else if (msg.mentions.users.first() && args[1]) {

		doTheThing(msg.channel, parseInt(args[1]), msg.mentions.users.first());

	}
};

exports.conf = {
	guildOnly: true,
	aliases: ["p"],
	permLevel: 2,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "purge",
	description: "Purge the most recent X amount of messages or most recent X amount from a specific user.",
	extendedDescription: "<amount>\n* Amount of messages to delete (excluding your own command message).\n\n<mention>\n* An @mention for the user you want to delete messages from.\n\n= Examples =\n\"purge @Alliance 5\" :: This will purge the 5 most recent messages posted by 'Alliance'.\n\"purge 10\" :: This will purge the 10 most recent messages posted by anyone, amount excluding your own command message.",
	usage: "purge <amount|@mention> [amount]"
};
