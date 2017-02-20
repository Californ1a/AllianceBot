const connection = require("../util/connection.js");
const pre = require("../config.json").prefix;

exports.run = (bot, msg, args) => {
	connection.select("*", "triviascore", `userid=${msg.author.id} AND server_id='${msg.guild.id}' LIMIT 1`).then(response => {
		if (!response[0]) {
			return msg.channel.sendMessage("You do not have any points to gamble with.");
		}
		if (!(args[0] && args[1])) {
			return msg.channel.sendMessage("You must specify an amount to gamble and a dice side to bet on.");
		}
		if (isNaN(args[0]) && isNaN(args[1])) {
			return msg.channel.sendMessage("Your gamble amount and dice side must be a number.");
		}
		var dieType = 6;
		var newScore = 0;
		var amount = parseInt(args[0]);
		if (amount < 1) {
			return msg.channel.sendMessage("You must bet more than one point.");
		}
		if (!(response[0].score >= amount)) {
			return msg.channel.sendMessage("You do not have enough points to bet that much.");
		}
		var side = parseInt(args[1]);
		if (!(side > 0 && side < dieType)) {
			return msg.channel.sendMessage("It is a 6-sided dice, you can only use 1-6.");
		}
		var die = Math.floor(Math.random() * dieType) + 1;
		if (side === die) {
			var scoreAdd = Math.floor(amount * (9/10));
			newScore = response[0].score + scoreAdd;
			connection.update("triviascore", `score=${newScore}`, `userid='${msg.author.id}'`).then(() => {
				msg.channel.sendMessage(`${msg.author}, The dice lands on ${die}! You win 90% of your bet (+${scoreAdd}, and bet amount returned)! Your score is now ${newScore}.`);
			}).catch(e => {
				msg.channel.sendMessage("Failed");
				console.error(e.stack);
				return;
			});
			return;
		}
		newScore = response[0].score - amount;
		if (newScore <= 0) {
			connection.del("triviascore", `userid='${msg.author.id}' AND server_id='${msg.guild.id}'`).then(() => {
				msg.channel.sendMessage(`${msg.author}, The dice lands on ${die}. You lose your bet (-${amount})! You have been removed from the scoreboard.`);
			}).catch(e => {
				msg.channel.sendMessage("Failed");
				console.error(e.stack);
				return;
			});
			return;
		}
		connection.update("triviascore", `score=${newScore}`, `userid='${msg.author.id}'`).then(() => {
			msg.channel.sendMessage(`${msg.author}, The dice lands on ${die}. You lose your bet (-${amount})! Your score is now ${newScore}`);
		}).catch(e => {
			msg.channel.sendMessage("Failed");
			console.error(e.stack);
			return;
		});
	}).catch(e => {
		console.error(e.stack);
		return;
	});
};

exports.conf = {
	guildOnly: false,
	aliases: [],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "dice",
	description: "Dice game",
	extendedDescription: `<amount>\n* The amount of score/points to bet.\n\n\<dice-side> (1-6)\n* The side of the dice to bet on.\n\n= Examples =\n"${pre}dice 10 3" :: This would bet 10 points on dice side 3.`,
	usage: "dice <amount> <dice-side>"
};
