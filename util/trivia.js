const connection = require("./connection.js");
//const trivia = require("../trivia.json");
const game = require("./games.js");
const colors = require("colors");
var triviaOn = false;
var incompleteQuestions = [];
var countQsMissed = 0;
var scoreAdd = 0;
var quesNum;
var events = require("events");
var eventEmitter = new events.EventEmitter();

var getTriviaStatus = () => {
	return triviaOn;
};

var toggleTriviaStatus = () => {
	triviaOn = !triviaOn;
};

var populateQuestions = () => {
	delete require.cache[require.resolve("../trivia.json")];
	incompleteQuestions = require("../trivia.json").filter(v => v.question !== "");
};

function checkQuestions(q) {
	return q.question === quesNum.question;
}

function removeQuestion() {
	if (!incompleteQuestions[0]) {
		populateQuestions();
	} else {
		var index = incompleteQuestions.findIndex(checkQuestions);
		if (index > -1) {
			incompleteQuestions.splice(index, 1);
		}
	}
	//console.log(incompleteQuestions);
}

var goTrivia = (channel, manualNumber, category, config) => {
	scoreAdd = 0;
	var alreadyAnswered = [];
	if (!getTriviaStatus()) {
		return;
	}
	quesNum = -1;


	if (manualNumber === -1) {
		if (!incompleteQuestions[0]) {
			populateQuestions();
		}
		quesNum = game.getRndmFromSet(incompleteQuestions);
	} else if (manualNumber < incompleteQuestions.length && manualNumber > -1) {
		quesNum = manualNumber;
	} else {
		if (!incompleteQuestions[0]) {
			populateQuestions();
		}
		quesNum = incompleteQuestions.indexOf(game.getRndmFromSet(incompleteQuestions));
	}

	// console.log(quesNum);
	// console.log(incompleteQuestions);
	var answerFilter = function(message) {
		var i = 0;
		for (i; i < quesNum.answers.length; i++) {
			if (message.content.toLowerCase() === quesNum.answers[i].toLowerCase()) {
				return true;
			}
		}
		if (quesNum.banswers) {
			i = 0;
			for (i; i < quesNum.banswers.length; i++) {
				if (message.content.toLowerCase() === quesNum.banswers[i].toLowerCase()) {
					scoreAdd = 1; //set to 1 from default 0 to give bonus +1
					return true;
				}
			}
		}
		return false;
	};
	var answerHintFilter = function(message) {
		var dontCount = false;
		var i = 0;
		var answeredLength = alreadyAnswered.length;
		for (i; i < answeredLength; i++) {
			if (alreadyAnswered[i] === message.author.id) {
				dontCount = true;
			}
		}
		if (!dontCount) {
			alreadyAnswered[answeredLength] = message.author.id;
		}
		if (quesNum.hanswers) {
			if (dontCount) {
				return false;
			} else {
				i = 0;
				for (i; i < quesNum.hanswers.length; i++) {
					if (message.content.toLowerCase() === quesNum.hanswers[i].toLowerCase()) {
						return true;
					}
				}
				for (i; i < quesNum.answers.length; i++) {
					if (message.content.toLowerCase() === quesNum.answers[i].toLowerCase()) {
						return true;
					}
				}
				return false;
			}
		} else {
			i = 0;
			for (i; i < quesNum.answers.length; i++) {
				if (message.content.toLowerCase() === quesNum.answers[i].toLowerCase()) {
					return true;
				}
			}
			return false;
		}
	};
	//var filter = response => response.content.toLowerCase() === trivia[quesNum].answer.toLowerCase();
	var emojiExpression = /:(\S+):/;
	//var emojiRegex = new RegExp(emojiExpression);
	var match;
	if (quesNum) {
		match = emojiExpression.exec(quesNum.question);
	} else {
		populateQuestions();
		quesNum = game.getRndmFromSet(incompleteQuestions);
		match = emojiExpression.exec(quesNum.question);
	}
	var question;
	if (match) {
		var emoji = channel.guild.emojis.find("name", match[1]);
		question = quesNum.question.replace(/_/g,"\\_");
		question = question.replace(/:\S+:/, emoji.toString());
	} else {
		question = quesNum.question.replace(/_/g,"\\_");
	}
	console.log(incompleteQuestions.length);
	console.log(colors.red(`Answer: ${quesNum.answers[0]}`));
	channel.sendMessage(`Question:\r\n**${question}**`).then(() => {
		scoreAdd = 0;
		channel.awaitMessages(answerFilter, {
			max: 1,
			time: config.delayBeforeHint,
			errors: ["time"],
		}).then((collected) => {
			var winnerid = collected.first().author.id;
			if (!getTriviaStatus()) {
				return;
			}
			scoreAdd += 2;
			eventEmitter.emit("manageCorrectAnswer", channel, collected, winnerid, scoreAdd, category, config);
		}).catch(() => {
			if (!getTriviaStatus()) {
				return;
			}
			channel.sendMessage(`Hint:\r\n${quesNum.hint.replace(/_/g,"\\_")}`).then(() => {
				channel.awaitMessages(answerHintFilter, {
					max: 1,
					time: config.delayBeforeNoAnswer,
					errors: ["time"],
				}).then((collected) => {
					var winnerid = collected.first().author.id;
					if (!getTriviaStatus()) {
						return;
					}
					scoreAdd += 1;
					eventEmitter.emit("manageCorrectAnswer", channel, collected, winnerid, scoreAdd, category, config);
				}).catch(() => {
					if (!getTriviaStatus()) {
						return;
					}
					countQsMissed += 1;
					channel.sendMessage("No one guessed correctly!").then(() => {
						if (countQsMissed < config.maxUnansweredQuestionsBeforeAutoStop) {
							removeQuestion();
							setTimeout(goTrivia, config.delayBeforeNextQuestion, channel, -1, category, config);
						} else {
							channel.sendMessage("Trivia has been automatically stopped.");
							toggleTriviaStatus();
						}
					});
				});
			});
		});
	});
};

eventEmitter.on("manageCorrectAnswer", (channel, collected, winnerid, scoreAdd, category, config) => {
	var score;
	connection.select("*", "triviascore", `userid=${winnerid} AND server_id='${channel.guild.id}' LIMIT 1`).then(response => {
		if (response[0]) {
			score = response[0].score + scoreAdd;
			connection.update("triviascore", `score=${score}`, `userid='${winnerid}' AND server_id='${channel.guild.id}'`).catch(e => console.error(e.stack));
		} else {
			score = scoreAdd;
			var info = {
				"userid": winnerid,
				"score": scoreAdd,
				"server_id": channel.guild.id
			};
			connection.insert("triviascore", info).catch(e => console.error(e.stack));
		}
		removeQuestion();
		countQsMissed = 0;
		var bonus = (scoreAdd === 3) ? `You gain a +1 bonus for ${quesNum.bonusText}! ` : "";
		channel.sendMessage(`${collected.first().author} guessed correctly (+${scoreAdd})! ${bonus}${(response[0])?`Your score is now ${score}`:`You have been added to the board with a score of ${score}`}.`).then(() => {
			setTimeout(goTrivia, config.delayBeforeNextQuestion, channel, -1, category, config);
		});
	}).catch(e => console.error(e.stack));
});

var timedTrivia = function(channel, minutes, trivStartUser, category, cmd, config, startingScores) {
	var time = (minutes*60)*1000;
	toggleTriviaStatus();
	populateQuestions();
	channel.sendMessage("```markdown\r\n# Trivia is about to start (" + Math.floor(config.delayBeforeFirstQuestion/1000) + "s)!\r\nBefore it does, here is some info:\r\n\r\n**Info**\r\n*  Questions are presented in **bold** and you're free to guess as many times as you like until the hint appears!  \r\n*  Hints will appear automatically " + Math.floor(config.delayBeforeHint/1000) + "s after the question. There is no hint command.  \r\n*  There is " + Math.floor(config.delayBeforeHint/1000) + "s between question and hint, " + Math.floor(config.delayBeforeNoAnswer/1000) + "s between hint and timeout, and " + Math.floor(config.delayBeforeNextQuestion/1000) + "s between timeout and next question.  \r\n*  If the hint is *multiple choice* , you only get **one** guess after it appears. Extra guesses (even if correct) are ignored.  \r\n*  If the hint is *not* multiple choice, then you may continue to guess many more times.\r\n\r\n**Commands**\r\n*  You can use the \"!score\" command to view your current scoreboard rank and score.  \r\n*  You can use \"!score b\" or \"!score board\" to view the current top players.  \r\n*  You can also use \"!score @mention\" to view that specific player's rank and score.```");
	setTimeout(goTrivia, config.delayBeforeFirstQuestion, channel, -1, category, config);
	setTimeout(function() {
		if (triviaOn) {
			toggleTriviaStatus();
			channel.sendMessage(`Everyone thank ${trivStartUser} for the trivia round! \`\`\`markdown\r\n# TRIVIA STOPPED!\`\`\``).then(() => {
				game.getChanges(channel, startingScores, "**Final Standings:**", 9);
				game.cooldown(cmd);
			});
		}
	}, time);
};

module.exports = {
	getTriviaStatus,
	timedTrivia,
	toggleTriviaStatus,
	populateQuestions,
	goTrivia
};
