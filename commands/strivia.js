const connection = require("../util/connection.js");
const triviaconfig = require("../config.json").trivia;
const game = require("../util/game.js");
var delayBeforeFirstQ = triviaconfig.delayBeforeFirstQuestion;
var delayBeforeNextQ = triviaconfig.delayBeforeNextQuestion;
var delayBeforeH = triviaconfig.delayBeforeHint;
var delayBeforeNoA = triviaconfig.delayBeforeNoAnswer;
var trivStartUser;
var startingScores;

exports.run = (bot, msg, args, perm, cmd) => {
	var category = "default";
	if (perm >= 2 && (msg.channel.id === "279033061490950146" || msg.guild.id === "211599888222257152")) {
		if (args[0]) {
			if (!game.trivia.getStatus() && !game.scramble.getStatus()) {
				game.trivia.toggleStatus();
				game.trivia.populateQ(category);
				msg.channel.sendMessage("Trivia Started with manual question number!");
				game.trivia.go(msg.channel, args[0], category, triviaconfig);
			} else if (game.trivia.getStatus() && !game.scramble.getStatus()) {
				game.trivia.toggleStatus();
				msg.channel.sendMessage("```markdown\r\n# TRIVIA STOPPED!```").then(() => {
					game.getLB(msg.channel, "**Final Standings:**", 9);
					game.cooldown(cmd);
				});
			} else if (game.scramble.getStatus()) {
				return msg.channel.sendMessage("Scramble is currently running, you cannot start a Trivia game.");
			} else {
				console.log("wut3");
			}
		} else {
			if (!game.trivia.getStatus() && !game.scramble.getStatus()) {
				startingScores = 0;
				connection.select("userid, score, rank", `(SELECT userid, score, @curRank := IF(@prevRank = score, @curRank, @incRank) AS rank, @incRank := @incRank + 1, @prevRank := score FROM triviascore t, (SELECT @curRank :=0, @prevRank := NULL, @incRank := 1) r WHERE server_id='${msg.channel.guild.id}' ORDER BY score DESC) s`).then(response => {
					startingScores = response;
					game.trivia.toggleStatus();
					game.trivia.populateQ("default");
					msg.channel.sendMessage("```markdown\r\n# Trivia is about to start (" + Math.floor(delayBeforeFirstQ / 1000) + "s)!\r\nBefore it does, here is some info:\r\n\r\n**Info**\r\n*  Questions are presented in **bold** and you're free to guess as many times as you like until the hint appears!  \r\n*  Hints will appear automatically " + Math.floor(delayBeforeH / 1000) + "s after the question. There is no hint command.  \r\n*  There is " + Math.floor(delayBeforeH / 1000) + "s between question and hint, " + Math.floor(delayBeforeNoA / 1000) + "s between hint and timeout, and " + Math.floor(delayBeforeNextQ / 1000) + "s between timeout and next question.  \r\n*  If the hint is *multiple choice* , you only get **one** guess after it appears. Extra guesses (even if correct) are ignored.  \r\n*  If the hint is *not* multiple choice, then you may continue to guess many more times.\r\n\r\n**Commands**\r\n*  You can use the \"!score\" command to view your current scoreboard rank and score.  \r\n*  You can use \"!score b\" or \"!score board\" to view the current top players.  \r\n*  You can also use \"!score @mention\" to view that specific player's rank and score.```");
					setTimeout(function() {
						game.trivia.go(msg.channel, -1, category, triviaconfig);
					}, delayBeforeFirstQ);
				});
			} else if (game.trivia.getStatus() && !game.scramble.getStatus()) {
				game.trivia.toggleStatus();
				msg.channel.sendMessage("```markdown\r\n# TRIVIA STOPPED!```").then(() => {
					game.getChanges(msg.channel, startingScores, "**Final Standings:**", 9);
					game.cooldown(cmd);
				});
			} else if (game.scramble.getStatus()) {
				return msg.channel.sendMessage("Scramble is currently running, you cannot start a Trivia game.");
			} else {
				console.log("wut4");
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
			var minutes = Math.floor((cost-4)/3);
			if (cost > response[0].score) {
				return msg.channel.sendMessage(`You do not have enough points. You would need ${cost} points to keep trivia going for ${minutes} ${(minutes < 2) ? "minute" : "minutes"}. You only have ${response[0].score} points.\r\nTrivia costs 4 points to start and an additional 3 points for every minute you want to run the game.`);
			} else if (minutes < 1) {
				return msg.channel.sendMessage("You can't start trivia with that few points.\r\nTrivia costs 4 points to start and an additional 3 points for every minute you want to run the game (minimum 7 points).");
			}
			msg.channel.sendMessage(`Spending ${cost} points will get you ${minutes} ${(minutes < 2) ? "minute" : "minutes"} of trivia time. Are you sure you want to start trivia?\r\nTrivia costs 4 points to start and an additional 3 points for every minute you want to run the game.`);
			msg.channel.awaitMessages(r => (r.content === "y" || r.content === "yes" || r.content === "n" || r.content === "no") && msg.author.id === r.author.id, {
				max: 1,
				time: 30000,
				errors: ["time"],
			}).then((collected) => {
				if (collected.first().content === "n" || collected.first().content === "no") {
					return msg.channel.sendMessage("Trivia will not be started, no points deducted.");
				}
				trivStartUser = collected.first().author;
				var newScore = parseInt(response[0].score) - cost;
				if (newScore > 0) {
					connection.update("triviascore", `score=${newScore}`, `userid='${trivStartUser.id}' AND server_id='${msg.guild.id}'`).then(() => {
						msg.channel.sendMessage(`${trivStartUser}, Your score is now ${newScore}. Trivia will begin and last for ${minutes} ${(minutes < 2) ? "minute" : "minutes"}.`).then(() => {
							startingScores = 0;
							connection.select("userid, score, rank", `(SELECT userid, score, @curRank := IF(@prevRank = score, @curRank, @incRank) AS rank, @incRank := @incRank + 1, @prevRank := score FROM triviascore t, (SELECT @curRank :=0, @prevRank := NULL, @incRank := 1) r WHERE server_id='${msg.channel.guild.id}' ORDER BY score DESC) s`).then(response => {
								startingScores = response;
								game.trivia.timed(msg.channel, minutes, trivStartUser, category, cmd, triviaconfig, startingScores);
							});
						});
					}).catch(e => {
						msg.channel.sendMessage("Failed");
						console.error(e.stack);
						return;
					});
					return;
				}
				connection.del("triviascore", `userid='${trivStartUser.id}' AND server_id='${msg.guild.id}'`).then(() => {
					msg.channel.sendMessage(`${trivStartUser}, You have been removed from the scoreboard. Trivia will begin and last for ${minutes} ${(minutes < 2) ? "minute" : "minutes"}.`).then(() => {
						startingScores = 0;
						connection.select("userid, score, rank", `(SELECT userid, score, @curRank := IF(@prevRank = score, @curRank, @incRank) AS rank, @incRank := @incRank + 1, @prevRank := score FROM triviascore t, (SELECT @curRank :=0, @prevRank := NULL, @incRank := 1) r WHERE server_id='${msg.channel.guild.id}' ORDER BY score DESC) s`).then(response => {
							startingScores = response;
							game.trivia.timed(msg.channel, minutes, trivStartUser, category, cmd, triviaconfig, startingScores);
						});
					});
				}).catch(e => {
					msg.channel.sendMessage("Failed");
					console.error(e.stack);
					return;
				});
			}).catch(() => {
				msg.channel.sendMessage("You took too long to respond. Trivia will not be started, no points deducted.");
			});
		}).catch(e => console.error(e.stack));
	} else if (trivStartUser && msg.author.id === trivStartUser.id && game.getTriviaStatus()) {
		msg.channel.sendMessage("```markdown\r\n# TRIVIA STOPPED!```").then(() => {
			game.trivia.toggleStatus();
			game.getChanges(msg.channel, startingScores, "**Final Standings:**", 9);
			game.cooldown(cmd);
		});
	} else {
		msg.channel.sendMessage("You do not have permission to start trivia without paying.");
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
	name: "strivia",
	description: "Start trivia",
	extendedDescription: "",
	usage: "strivia <points>"
};
