const trivia = require("../trivia.json");
const connection = require("./connection.js");
var triviaconfig = require("../config.json").trivia;
var delayBeforeFirstQ = triviaconfig.delayBeforeFirstQuestion;
var delayBeforeNextQ = triviaconfig.delayBeforeNextQuestion;
var delayBeforeH = triviaconfig.delayBeforeHint;
var delayBeforeNoA = triviaconfig.delayBeforeNoAnswer;
var maxQs = triviaconfig.maxUnansweredQuestionsBeforeAutoStop;
var i = 0;
var incompleteQuestions = [];
var scoreAdd = 0;
var countQsMissed = 0;
var triviaOn = false;

var getStatus = function() {
	return triviaOn;
};


function getRndmFromSet(set) {
	var rndm = Math.floor(Math.random() * set.length);
	return set[rndm];
}

var populateQuestions = function (category) {
	if (category === "default") {
		category = "Distance";
	}
	//var j = 0;
	incompleteQuestions = [];
	i = 0;
	for (i; i < trivia.length; i++) {
		if (trivia[i].question !== "") {
			incompleteQuestions.push(i);
			//here
			// for (j; j < trivia[i].categories.length; j++) {
			// 	console.log("wut" + j);
			// 	if (trivia[i].categories[j].toLowerCase() === category.toLowerCase()) {
			// 		incompleteQuestions.push(i);
			// 		//there
			// 	}
			// }
		}
	}
};

function removeQuestion(quesNum, category) {
	if (incompleteQuestions.length === 1) {
		populateQuestions(category);
	} else {
		var index = incompleteQuestions.indexOf(quesNum);
		if (index > -1) {
			incompleteQuestions.splice(index, 1);
		}
	}
	//console.log(incompleteQuestions);
}

function manageCorrectAnswer(channel, collected, winnerid, scoreAdd, quesNum, category) {
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
		removeQuestion(quesNum, category);
		countQsMissed = 0;
		var bonus = (scoreAdd === 3) ? `You gain a +1 bonus for ${trivia[quesNum].bonusText}! ` : "";
		channel.sendMessage(`${collected.first().author} guessed correctly (+${scoreAdd})! ${bonus}Your score is now ${score}.`).then(() => {
			setTimeout(goTrivia, delayBeforeNextQ, channel, -1, category);
		});
	}).catch(e => console.error(e.stack));
}

var toggleStatus = function() {
	triviaOn = !triviaOn;
};


var goTrivia = function (channel, manualNumber, category) {
	scoreAdd = 0;
	var alreadyAnswered = [];
	if (triviaOn) {
		var quesNum = -1;
		if (manualNumber === -1) {
			if (incompleteQuestions.length <= 1) {
				populateQuestions(category);
				quesNum = getRndmFromSet(incompleteQuestions);
			} else {
				quesNum = getRndmFromSet(incompleteQuestions);
			}
		} else if (manualNumber < trivia.length && manualNumber > -1) {
			quesNum = manualNumber;
		} else {
			if (incompleteQuestions.length <= 1) {
				populateQuestions(category);
				quesNum = getRndmFromSet(incompleteQuestions);
			} else {
				quesNum = getRndmFromSet(incompleteQuestions);
			}
		}
		// console.log(quesNum);
		// console.log(incompleteQuestions);
		var answerFilter = function(message) {
			i = 0;
			for (i; i < trivia[quesNum].answers.length; i++) {
				if (message.content.toLowerCase() === trivia[quesNum].answers[i].toLowerCase()) {
					return true;
				}
			}
			if (trivia[quesNum].banswers) {
				i = 0;
				for (i; i < trivia[quesNum].banswers.length; i++) {
					if (message.content.toLowerCase() === trivia[quesNum].banswers[i].toLowerCase()) {
						scoreAdd = 1; //set to 1 from default 0 to give bonus +1
						return true;
					}
				}
			}
			return false;
		};
		var answerHintFilter = function(message) {
			var dontCount = false;
			i = 0;
			var answeredLength = alreadyAnswered.length;
			for (i; i < answeredLength; i++) {
				if (alreadyAnswered[i] === message.author.id) {
					dontCount = true;
				}
			}
			if (!dontCount) {
				alreadyAnswered[answeredLength] = message.author.id;
			}
			if (trivia[quesNum].hanswers) {
				if (dontCount) {
					return false;
				} else {
					i = 0;
					for (i; i < trivia[quesNum].hanswers.length; i++) {
						if (message.content.toLowerCase() === trivia[quesNum].hanswers[i].toLowerCase()) {
							return true;
						}
					}
					for (i; i < trivia[quesNum].answers.length; i++) {
						if (message.content.toLowerCase() === trivia[quesNum].answers[i].toLowerCase()) {
							return true;
						}
					}
					return false;
				}
			} else {
				i = 0;
				for (i; i < trivia[quesNum].answers.length; i++) {
					if (message.content.toLowerCase() === trivia[quesNum].answers[i].toLowerCase()) {
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
		if (trivia[quesNum]) {
			match = emojiExpression.exec(trivia[quesNum].question);
		} else {
			populateQuestions(category);
			quesNum = getRndmFromSet(incompleteQuestions);
			match = emojiExpression.exec(trivia[quesNum].question);
		}
		var question;
		if (match) {
			var emoji = channel.guild.emojis.find("name", match[1]);
			question = trivia[quesNum].question.replace(/_/g,"\\_");
			question = question.replace(/:\S+:/, emoji.toString());
		} else {
			question = trivia[quesNum].question.replace(/_/g,"\\_");
		}
		//console.log(quesNum);
		console.log(incompleteQuestions.length);
		channel.sendMessage(`Question:\r\n**${question}**`).then(() => {
			scoreAdd = 0;
			channel.awaitMessages(answerFilter, {
				max: 1,
				time: delayBeforeH,
				errors: ["time"],
			}).then((collected) => {
				var winnerid = collected.first().author.id;
				if (triviaOn) {
					scoreAdd += 2;
					manageCorrectAnswer(channel, collected, winnerid, scoreAdd, quesNum, category);
				}
			}).catch(() => {
				if (triviaOn) {
					channel.sendMessage(`Hint:\r\n${trivia[quesNum].hint.replace(/_/g,"\\_")}`).then(() => {
						channel.awaitMessages(answerHintFilter, {
							max: 1,
							time: delayBeforeNoA,
							errors: ["time"],
						}).then((collected) => {
							var winnerid = collected.first().author.id;
							if (triviaOn) {
								scoreAdd += 1;
								manageCorrectAnswer(channel, collected, winnerid, scoreAdd, quesNum, category);
							}
						}).catch(() => {
							if (triviaOn) {
								removeQuestion(quesNum, category);
								countQsMissed += 1;
								channel.sendMessage("No one guessed correctly!").then(() => {
									if (countQsMissed < maxQs) {
										setTimeout(goTrivia, delayBeforeNextQ, channel, -1, category);
									} else {
										channel.sendMessage("Trivia has been automatically stopped.");
										toggleStatus();
									}
								});
							}
						});
					});
				}
			});
		});
	}
};

var getLB = function (channel, topMessage) {
	connection.select("userid, score, rank", `(SELECT userid, score, @curRank := IF(@prevRank = score, @curRank, @incRank) AS rank, @incRank := @incRank + 1, @prevRank := score FROM triviascore t, (SELECT @curRank :=0, @prevRank := NULL, @incRank := 1) r WHERE server_id='${channel.guild.id}' ORDER BY score DESC) s LIMIT 9`).then(response => {
		if (!response[0]) {
			return channel.sendMessage("There are no trivia scores yet.");
		}
		//var text = "";
		var nameArray = [""];
		var scoreArray = [0];
		var rankArray = [0];
		i = 0;
		for (i; i < response.length; i++) {
			nameArray[i] = channel.guild.members.get(response[i].userid).displayName;
			scoreArray[i] = response[i].score;
			rankArray[i] = response[i].rank;
			//text += `${response[i].rank} - ${cl.getDisplayName(message.guild.members.get(response[i].userid))} - ${response[i].score}\r\n`;
		}
		var fieldsArray = [""];
		i = 0;
		for (i; i < nameArray.length; i++) {
			fieldsArray[i] = {
				name: nameArray[i],
				value: `Rank: ${rankArray[i]}, Score: ${scoreArray[i]}`,
				inline: true
			};
		}
		channel.sendMessage(topMessage, {
			embed: {
				color: 3447003,
				title: `__**Top ${fieldsArray.length} Trivia Scoreboard**__`,
				fields: fieldsArray
			}
		}).catch((error) => console.error(error));
	}).catch(e => console.error(e.stack));
};

function cooldown(cmd) {
	cmd.conf.endGameCooldown = true;
	setTimeout(() => {
		cmd.conf.endGameCooldown = false;
	}, cmd.conf.endGameTimer);
}

function timedTrivia(channel, minutes, trivStartUser, category, cmd) {
	var time = (minutes*60)*1000;
	toggleStatus();
	populateQuestions("default");
	channel.sendMessage("```markdown\r\n# Trivia is about to start (" + Math.floor(delayBeforeFirstQ/1000) + "s)!\r\nBefore it does, here is some info:\r\n\r\n**Info**\r\n*  Questions are presented in **bold** and you're free to guess as many times as you like until the hint appears!  \r\n*  Hints will appear automatically " + Math.floor(delayBeforeH/1000) + "s after the question. There is no hint command.  \r\n*  There is " + Math.floor(delayBeforeH/1000) + "s between question and hint, " + Math.floor(delayBeforeNoA/1000) + "s between hint and timeout, and " + Math.floor(delayBeforeNextQ/1000) + "s between timeout and next question.  \r\n*  If the hint is *multiple choice* , you only get **one** guess after it appears. Extra guesses (even if correct) are ignored.  \r\n*  If the hint is *not* multiple choice, then you may continue to guess many more times.\r\n\r\n**Commands**\r\n*  You can use the \"!score\" command to view your current scoreboard rank and score.  \r\n*  You can use \"!score b\" or \"!score board\" to view the current top players.  \r\n*  You can also use \"!score @mention\" to view that specific player's rank and score.```");
	setTimeout(goTrivia, delayBeforeFirstQ, channel, -1, category);
	setTimeout(function() {
		if (triviaOn) {
			toggleStatus();
			channel.sendMessage(`Everyone thank ${trivStartUser} for the trivia round! \`\`\`markdown\r\n# TRIVIA STOPPED!\`\`\``).then(() => {
				getLB(channel, "**Final Standings:**");
				cooldown(cmd);
			});
		}
	}, time);
}

module.exports = {
	populateQuestions,
	getLB,
	goTrivia,
	timedTrivia,
	toggleStatus,
	getStatus
};
