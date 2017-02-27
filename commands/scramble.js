const connection = require("../util/connection.js");
const scrambleconfig = require("../config.json").scramble;
const game = require("../util/game.js");
var delayBeforeFirstQ = scrambleconfig.delayBeforeFirstQuestion;
var delayBeforeNextQ = scrambleconfig.delayBeforeNextQuestion;
var delayBeforeNoA = scrambleconfig.delayBeforeNoAnswer;
var trivStartUser;

exports.run = (bot, msg, args, perm, cmd) => {
	var category = "default";
	if (perm >= 2 && (msg.channel.id === "279033061490950146" || msg.guild.id === "211599888222257152")) {
		if (args[0]) {
			if (!game.scramble.getStatus() && !game.trivia.getStatus()) {
				game.scramble.toggleStatus();
				game.scramble.populateQ();
				msg.channel.sendMessage("Scramble Started with manual question number!");
				game.scramble.go(msg.channel, scrambleconfig);
			} else if (game.scramble.getStatus() && !game.trivia.getStatus()) {
				game.scramble.toggleStatus();
				msg.channel.sendMessage("```markdown\r\n# SCRAMBLE STOPPED!```").then(() => {
					game.getLB(msg.channel, "**Final Standings:**", 9);
					game.cooldown(cmd);
				});
			} else if (game.trivia.getStatus()) {
				return msg.channel.sendMessage("Trivia is currently running, you cannot start a Scramble game.");
			} else {
				console.log("wut");
			}
		} else {
			if (!game.scramble.getStatus() && !game.trivia.getStatus()) {
				game.scramble.toggleStatus();
				game.scramble.populateQ();
				msg.channel.sendMessage("```markdown\r\n# Scramble is about to start (" + Math.floor(delayBeforeFirstQ / 1000) + "s)!\r\nBefore it does, here is some info:\r\n\r\n**Info**\r\n*  Terms are presented in **bold** and you're free to guess as many times as you like until it times out.  \r\n*  There are no hints.  \r\n*  There is " + Math.floor(delayBeforeNoA / 1000) + "s between scramble and timeout, and " + Math.floor(delayBeforeNextQ / 1000) + "s between timeout and next question.  \r\n\r\n**Commands**\r\n*  You can use the \"!score\" command to view your current scoreboard rank and score.  \r\n*  You can use \"!score board\" to view the current top players.  \r\n*  You can also use \"!score @mention\" to view that specific player's rank and score.```");
				setTimeout(function() {
					game.scramble.go(msg.channel, scrambleconfig);
				}, delayBeforeFirstQ);
			} else if (game.scramble.getStatus() && !game.trivia.getStatus()) {
				game.scramble.toggleStatus();
				msg.channel.sendMessage("```markdown\r\n# SCRAMBLE STOPPED!```").then(() => {
					game.getLB(msg.channel, "**Final Standings:**", 9);
					game.cooldown(cmd);
				});
			}else if (game.trivia.getStatus()) {
				return msg.channel.sendMessage("Trivia is currently running, you cannot start a Scramble game.");
			} else {
				console.log("wut2");
			}
		}
	} else if (args[0] && (msg.channel.id === "279033061490950146" || msg.guild.id === "211599888222257152")) {
		if (isNaN(args[0])) {
			return msg.channel.sendMessage("Amount must be a number.");
		}
		connection.select("*", "triviascore", `userid='${msg.author.id}' AND server_id='${msg.guild.id}'`).then(response => {
			if (!response[0]) {
				return msg.channel.sendMessage("You don't have any points.");
			}
			var cost = parseInt(args[0]);
			var minutes = Math.floor((cost-5)/1);
			if (cost > response[0].score) {
				return msg.channel.sendMessage(`You do not have enough points. You would need ${cost} points to keep scramble going for ${minutes} ${(minutes < 2) ? "minute" : "minutes"}. You only have ${response[0].score} points.\r\Scramble costs 5 points to start and an additional 1 point for every minute you want to run the game.`);
			} else if (minutes < 1) {
				return msg.channel.sendMessage("You can't start scramble with that few points.\r\nScramble costs 5 points to start and an additional 3 points for every minute you want to run the game (minimum 6 points).");
			}
			msg.channel.sendMessage(`Spending ${cost} points will get you ${minutes} ${(minutes < 2) ? "minute" : "minutes"} of scramble time. Are you sure you want to start scramble?\r\nScramble costs 5 points to start and an additional 1 point for every minute you want to run the game.`);
			msg.channel.awaitMessages(r => (r.content === "y" || r.content === "yes" || r.content === "n" || r.content === "no") && msg.author.id === r.author.id, {
				max: 1,
				time: 30000,
				errors: ["time"],
			}).then((collected) => {
				if (collected.first().content === "n" || collected.first().content === "no") {
					return msg.channel.sendMessage("Scramble will not be started, no points deducted.");
				}
				trivStartUser = collected.first().author;
				var newScore = parseInt(response[0].score) - cost;
				if (newScore > 0) {
					connection.update("triviascore", `score=${newScore}`, `userid='${trivStartUser.id}' AND server_id='${msg.guild.id}'`).then(() => {
						msg.channel.sendMessage(`${trivStartUser}, Your score is now ${newScore}. Scramble will begin and last for ${minutes} ${(minutes < 2) ? "minute" : "minutes"}.`).then(() => {
							game.scramble.timed(msg.channel, minutes, trivStartUser, category, cmd, scrambleconfig);
						});
					}).catch(e => {
						msg.channel.sendMessage("Failed");
						console.error(e.stack);
						return;
					});
					return;
				}
				connection.del("triviascore", `userid='${trivStartUser.id}' AND server_id='${msg.guild.id}'`).then(() => {
					msg.channel.sendMessage(`${trivStartUser}, You have been removed from the scoreboard. Scramble will begin and last for ${minutes} minute${(minutes > 1)?"s":""}.`).then(() => {
						game.scramble.timed(msg.channel, minutes, trivStartUser, category, cmd, scrambleconfig);
					});
				}).catch(e => {
					msg.channel.sendMessage("Failed");
					console.error(e.stack);
					return;
				});
			}).catch(() => {
				msg.channel.sendMessage("You took too long to respond. Scramble will not be started, no points deducted.");
			});
		}).catch(e => console.error(e.stack));
	} else if (trivStartUser && msg.author.id === trivStartUser.id && game.scramble.getStatus() && !game.trivia.getStatus()) {
		msg.channel.sendMessage("```markdown\r\n# SCRAMBLE STOPPED!```").then(() => {
			game.scramble.toggleStatus();
			game.getLB(msg.channel, "**Final Standings:**", 9);
			game.cooldown(cmd);
		});
	} else {
		msg.channel.sendMessage("You do not have permission to start scramble without paying.");
	}
};

exports.conf = {
	guildOnly: false,
	aliases: [],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000,
	endGameCooldown: false,
	endGameTimer: 61000
};

exports.help = {
	name: "scramble",
	description: "Start scramble",
	extendedDescription: "",
	usage: "scramble <points>"
};
