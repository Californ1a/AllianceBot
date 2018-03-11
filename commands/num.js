const num = require("../util/num.js");
const send = require("../util/sendMessage.js");

exports.run = (bot, msg, args, perm) => {
	let max = 10;
	let min = 1;
	if (args.length > 2 || (args.length <= 1 && perm < 4)) {
		return send(msg.channel, "You can only have one maximum and one minimum.");
	}
	if (args[0] && args[1] && !isNaN(args[0]) && !isNaN(args[1])) {
		max = Math.max(...args);
		min = Math.min(...args);
		if (!(parseInt(min) <= parseInt(max) - 50)) {
			return send(msg.channel, "The minimum must be at least 50 under the max.");
		}
	}
	num.toggleStatus();
	if (!num.getStatus()) {
		return send(msg.channel, "Stopped random number");
	}
	send(msg.channel, "Started random number");
	const rndm = Math.floor(Math.random() * max) + min;
	msg.channel.awaitMessages(response => response.content === `${rndm}`, {
		max: 1,
		time: 15000,
		errors: ["time"]
	}).then((collected) => {
		if (num.getStatus()) {
			const winnerid = collected.first().author.id;
			const scoreAdd = 1;
			num.manageCorrect(msg.channel, collected, winnerid, scoreAdd);
		}
	}).catch(() => {
		if (num.getStatus()) {
			send(msg.channel, "No one guessed correctly!").then(() => {
				num.toggleStatus();
			});
		}
	});
};

exports.conf = {
	guildOnly: true,
	aliases: [],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "num",
	description: "Start a random number guessing game, with custom min and max.",
	extendedDescription: "",
	usage: "num [min|max] [min|max]"
};
