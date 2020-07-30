//const connection = require("./connection.js");
//const trivia = require("../trivia.json");
const sm = require("./scoremanager.js");
const game = require("./games.js");
const colors = require("colors");
const send = require("./sendMessage.js");
const firebase = require("./firebase.js");
let triviaSet;
firebase.db.ref("trivia").once("value").then(data => {
	triviaSet = data.val().filter(v => v.question !== "");
});
let triviaOn = false;
let incompleteQuestions = [];
let countQsMissed = 0;
let scoreAdd = 0;
let quesNum;
const events = require("events");
const eventEmitter = new events.EventEmitter();

const getTriviaStatus = () => {
	return triviaOn;
};

const toggleTriviaStatus = () => {
	triviaOn = !triviaOn;
};

const populateQuestions = () => {
	// delete require.cache[require.resolve("../gameconfigs/trivia.json")];
	// incompleteQuestions = require("../gameconfigs/trivia.json").filter(v => v.question !== "");
	incompleteQuestions = JSON.parse(JSON.stringify(triviaSet));
};

function checkQuestions(q) {
	return q.question === quesNum.question;
}

function removeQuestion() {
	if (!incompleteQuestions[0]) {
		populateQuestions();
	} else {
		const index = incompleteQuestions.findIndex(checkQuestions);
		if (index > -1) {
			incompleteQuestions.splice(index, 1);
		}
	}
	//console.log(incompleteQuestions);
}

const goTrivia = (channel, manualNumber, category, config, startingScores) => {
	scoreAdd = 0;
	const alreadyAnswered = [];
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
	const answerFilter = function (message) {
		let i = 0;
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
	const answerHintFilter = function (message) {
		let dontCount = false;
		let i = 0;
		const answeredLength = alreadyAnswered.length;
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
	const emojiExpression = /:(\S+):/;
	//var emojiRegex = new RegExp(emojiExpression);
	let match;
	if (quesNum) {
		match = emojiExpression.exec(quesNum.question);
	} else {
		populateQuestions();
		quesNum = game.getRndmFromSet(incompleteQuestions);
		match = emojiExpression.exec(quesNum.question);
	}
	let question;
	if (match) {
		const emoji = channel.guild.emojis.cache.find(val => val.name === match[1]);
		question = quesNum.question.replace(/_/g, "\\_");
		question = question.replace(/:\S+:/, emoji.toString());
	} else {
		question = quesNum.question.replace(/_/g, "\\_");
	}
	console.log(colors.red(`Remaining questions: ${incompleteQuestions.length}, Answer: ${quesNum.answers[0]}`));
	send(channel, `Question:\r\n**${question}**`).then(() => {
		scoreAdd = 0;
		channel.awaitMessages(answerFilter, {
			max: 1,
			time: config.delayBeforeHint,
			errors: ["time"]
		}).then((collected) => {
			const winnerid = collected.first().author.id;
			if (!getTriviaStatus()) {
				return;
			}
			scoreAdd += 2;
			eventEmitter.emit("manageCorrectAnswer", channel, collected, winnerid, scoreAdd, category, config);
		}).catch(() => {
			if (!getTriviaStatus()) {
				return;
			}
			send(channel, `Hint:\r\n${quesNum.hint.replace(/_/g, "\\_")}`).then(() => {
				channel.awaitMessages(answerHintFilter, {
					max: 1,
					time: config.delayBeforeNoAnswer,
					errors: ["time"]
				}).then((collected) => {
					const winnerid = collected.first().author.id;
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
					send(channel, "No one guessed correctly!").then(() => {
						if (countQsMissed < config.maxUnansweredQuestionsBeforeAutoStop) {
							removeQuestion();
							setTimeout(goTrivia, config.delayBeforeNextQuestion, channel, -1, category, config);
						} else {
							send(channel, "Trivia has been automatically stopped.");
							if (startingScores) {
								game.getChanges(channel, startingScores, "**Final Standings:**", 9);
							}
							toggleTriviaStatus();
						}
					});
				});
			});
		});
	});
};

eventEmitter.on("manageCorrectAnswer", (channel, collected, winnerid, scoreAdd, category, config) => {
	const member = channel.guild.members.cache.get(winnerid);
	sm.setScore(channel.guild, member, "add", scoreAdd).then(m => {
		removeQuestion();
		countQsMissed = 0;
		const bonus = (scoreAdd === 3) ? `You gain a +1 bonus for ${quesNum.bonusText}! ` : "";
		send(channel, `${collected.first().author} guessed correctly (+${scoreAdd})! ${bonus}${(m.message.startsWith("Set"))?`Your score is now ${m.score}`:`You have been added to the board with a score of ${m.score}`}.`).then(() => {
			setTimeout(goTrivia, config.delayBeforeNextQuestion, channel, -1, category, config);
		});
	}).catch(e => console.error(e.stack));
});

const timedTrivia = function (channel, minutes, trivStartUser, category, cmd, config, startingScores) {
	const time = (minutes * 60) * 1000;
	toggleTriviaStatus();
	populateQuestions();
	send(channel, "```markdown\r\n# Trivia is about to start (" + Math.floor(config.delayBeforeFirstQuestion / 1000) + "s)!\r\nBefore it does, here is some info:\r\n\r\n**Info**\r\n*  Questions are presented in **bold** and you're free to guess as many times as you like until the hint appears!  \r\n*  Hints will appear automatically " + Math.floor(config.delayBeforeHint / 1000) + "s after the question. There is no hint command.  \r\n*  There is " + Math.floor(config.delayBeforeHint / 1000) + "s between question and hint, " + Math.floor(config.delayBeforeNoAnswer / 1000) + "s between hint and timeout, and " + Math.floor(config.delayBeforeNextQuestion / 1000) + "s between timeout and next question.  \r\n*  If the hint is *multiple choice* , you only get **one** guess after it appears. Extra guesses (even if correct) are ignored.  \r\n*  If the hint is *not* multiple choice, then you may continue to guess many more times.\r\n\r\n**Commands**\r\n*  You can use the \"!score\" command to view your current scoreboard rank and score.  \r\n*  You can use \"!score b\" or \"!score board\" to view the current top players.  \r\n*  You can also use \"!score @mention\" to view that specific player's rank and score.```");
	setTimeout(goTrivia, config.delayBeforeFirstQuestion, channel, -1, category, config, startingScores);
	setTimeout(function () {
		if (triviaOn) {
			toggleTriviaStatus();
			send(channel, `Everyone thank ${trivStartUser} for the trivia round! \`\`\`markdown\r\n# TRIVIA STOPPED!\`\`\``).then(() => {
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
