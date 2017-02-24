const trivia = require("../trivia.json");
const connection = require("./connection.js");
const colors = require("colors");
var i = 0;
var incompleteQuestions = [];
var scoreAdd = 0;
var countQsMissed = 0;
var triviaOn = false;
var scrambleOn = false;

var getTriviaStatus = () => {
	return triviaOn;
};

var getScrambleStatus = () => {
	return scrambleOn;
};

function getRndmFromSet(set) {
	var rndm = Math.floor(Math.random() * set.length);
	return set[rndm];
}

var populateScramble = () => {
	delete require.cache[require.resolve("../scramble.json")];
	incompleteQuestions = require("../scramble.json").filter(v => v !== "");
};

function removeScrambleTerm(orig) {
	if (!incompleteQuestions[0]) {
		populateScramble();
	} else {
		var index = incompleteQuestions.indexOf(orig);
		if (index > -1) {
			incompleteQuestions.splice(index, 1);
		}
	}
}

function scramble(a) {
	var k = a.split("");
	var d;
	var b = a.length - 1;
	for (b; 0 < b; b--) {
		var c = Math.floor(Math.random() * (b + 1));
		d = k[b];
		k[b] = k[c];
		k[c] = d;
	}
	var ret = k.join("");
	if (ret.charAt(0) === " " || ret.charAt(ret.length-1) === " " || ret.includes("  ")) {
		ret = scramble(a);
	}
	return ret;
}



var populateQuestions = () => {
	//var j = 0;
	incompleteQuestions = [];
	i = 0;
	for (i; i < trivia.length; i++) {
		if (trivia[i].question !== "") {
			incompleteQuestions.push(i);
			////here
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

function removeQuestion(quesNum) {
	if (!incompleteQuestions[0]) {
		populateQuestions();
	} else {
		var index = incompleteQuestions.indexOf(quesNum);
		if (index > -1) {
			incompleteQuestions.splice(index, 1);
		}
	}
	//console.log(incompleteQuestions);
}

function manageCorrectAnswer(channel, collected, winnerid, scoreAdd, quesNum, category, config) {
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
		channel.sendMessage(`${collected.first().author} guessed correctly (+${scoreAdd})! ${bonus}${(response[0])?`Your score is now ${score}`:`You have been added to the board with a score of ${score}`}.`).then(() => {
			setTimeout(goTrivia, config.delayBeforeNextQuestion, channel, -1, category, config);
		});
	}).catch(e => console.error(e.stack));
}

function manageScrambleCorrect(channel, collected, winnerid, scoreAdd, config, orig) {
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
		removeScrambleTerm(orig);
		countQsMissed = 0;
		channel.sendMessage(`${collected.first().author} guessed correctly (+${scoreAdd})! ${(response[0])?`Your score is now ${score}`:`You have been added to the board with a score of ${score}`}.`).then(() => {
			setTimeout(goScramble, config.delayBeforeNextQuestion, channel, config);
		});
	}).catch(e => console.error(e.stack));
}

var toggleTriviaStatus = () => {
	triviaOn = !triviaOn;
};

var toggleScrambleStatus = () => {
	scrambleOn = !scrambleOn;
};

var goScramble = (channel, config) => {
	if (!getScrambleStatus()) {
		return;
	}
	scoreAdd = 0;
	var curr;
	var orig;
	if (!incompleteQuestions[0]) {
		populateScramble();
	}
	orig = getRndmFromSet(incompleteQuestions);
	curr = scramble(orig);
	console.log(colors.red(`Term: ${orig}`));
	channel.sendMessage(`Term:\n**${curr.toUpperCase()}**`).then(() => {
		channel.awaitMessages(r => r.content.toLowerCase() === orig.toLowerCase(), {
			max: 1,
			time: config.delayBeforeNoAnswer,
			errors: ["time"],
		}).then((collected) => {
			var winnerid = collected.first().author.id;
			if (!getScrambleStatus()) {
				return;
			}
			scoreAdd += 1;
			manageScrambleCorrect(channel, collected, winnerid, scoreAdd, config, orig);
		}).catch(() => {
			if (!getScrambleStatus()) {
				return;
			}
			countQsMissed += 1;
			channel.sendMessage("No one guessed correctly!").then(() => {
				if (countQsMissed < config.maxUnansweredQuestionsBeforeAutoStop) {
					removeScrambleTerm(orig);
					setTimeout(goScramble, config.delayBeforeNextQuestion, channel, config);
				} else {
					channel.sendMessage("Scramble has been automatically stopped.");
					toggleScrambleStatus();
				}
			});
		});
	}).catch(e => console.error(e.stack));
};

var goTrivia = (channel, manualNumber, category, config) => {
	scoreAdd = 0;
	var alreadyAnswered = [];
	if (!getTriviaStatus()) {
		return;
	}
	var quesNum = -1;
	if (manualNumber === -1) {
		if (incompleteQuestions.length <= 1) {
			populateQuestions();
			quesNum = getRndmFromSet(incompleteQuestions);
		} else {
			quesNum = getRndmFromSet(incompleteQuestions);
		}
	} else if (manualNumber < trivia.length && manualNumber > -1) {
		quesNum = manualNumber;
	} else {
		if (incompleteQuestions.length <= 1) {
			populateQuestions();
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
		populateQuestions();
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
	console.log(colors.red(`Answer: ${trivia[quesNum].answers[0]}`));
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
			manageCorrectAnswer(channel, collected, winnerid, scoreAdd, quesNum, category, config);
		}).catch(() => {
			if (!getTriviaStatus()) {
				return;
			}
			channel.sendMessage(`Hint:\r\n${trivia[quesNum].hint.replace(/_/g,"\\_")}`).then(() => {
				channel.awaitMessages(answerHintFilter, {
					max: 1,
					time: config.delayBeforeNoAanswer,
					errors: ["time"],
				}).then((collected) => {
					var winnerid = collected.first().author.id;
					if (!getTriviaStatus()) {
						return;
					}
					scoreAdd += 1;
					manageCorrectAnswer(channel, collected, winnerid, scoreAdd, quesNum, category, config);
				}).catch(() => {
					if (!getTriviaStatus()) {
						return;
					}
					removeQuestion(quesNum, category);
					countQsMissed += 1;
					channel.sendMessage("No one guessed correctly!").then(() => {
						if (countQsMissed < config.maxUnansweredQuestionsBeforeAutoStop) {
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

var getLB = (channel, topMessage, limit) => {
	connection.select("userid, score, rank", `(SELECT userid, score, @curRank := IF(@prevRank = score, @curRank, @incRank) AS rank, @incRank := @incRank + 1, @prevRank := score FROM triviascore t, (SELECT @curRank :=0, @prevRank := NULL, @incRank := 1) r WHERE server_id='${channel.guild.id}' ORDER BY score DESC) s LIMIT ${limit}`).then(response => {
		if (!response[0]) {
			return channel.sendMessage("There are no trivia scores yet.");
		}
		//var text = "";
		var nameArray = [];
		var scoreArray = [];
		var rankArray = [];
		i = 0;
		for (i; i < response.length; i++) {
			if (channel.guild.members.get(response[i].userid)) {
				nameArray.push(channel.guild.members.get(response[i].userid).displayName);
				scoreArray.push(response[i].score);
				rankArray.push(response[i].rank);
			} else {
				connection.del("triviascore", `server_id='${channel.guild.id}' AND userid=${response[i].userid}`).then(() => {
					console.log(colors.red(`Deleted user with id '${response[i].userid}' from the leaderboard.`));
				}).catch(e => console.error(e.stack));
				console.log(nameArray);
				return getLB(channel, topMessage, limit);
			}
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
				title: `__**Top ${fieldsArray.length} Scoreboard**__`,
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

function timedTrivia(channel, minutes, trivStartUser, category, cmd, config) {
	var time = (minutes*60)*1000;
	toggleTriviaStatus();
	populateQuestions();
	channel.sendMessage("```markdown\r\n# Trivia is about to start (" + Math.floor(config.delayBeforeFirstQuestion/1000) + "s)!\r\nBefore it does, here is some info:\r\n\r\n**Info**\r\n*  Questions are presented in **bold** and you're free to guess as many times as you like until the hint appears!  \r\n*  Hints will appear automatically " + Math.floor(config.delayBeforeHint/1000) + "s after the question. There is no hint command.  \r\n*  There is " + Math.floor(config.delayBeforeHint/1000) + "s between question and hint, " + Math.floor(config.delayBeforeNoAnswer/1000) + "s between hint and timeout, and " + Math.floor(config.delayBeforeNextQuestion/1000) + "s between timeout and next question.  \r\n*  If the hint is *multiple choice* , you only get **one** guess after it appears. Extra guesses (even if correct) are ignored.  \r\n*  If the hint is *not* multiple choice, then you may continue to guess many more times.\r\n\r\n**Commands**\r\n*  You can use the \"!score\" command to view your current scoreboard rank and score.  \r\n*  You can use \"!score b\" or \"!score board\" to view the current top players.  \r\n*  You can also use \"!score @mention\" to view that specific player's rank and score.```");
	setTimeout(goTrivia, config.delayBeforeFirstQuestion, channel, -1, category, config);
	setTimeout(function() {
		if (triviaOn) {
			toggleTriviaStatus();
			channel.sendMessage(`Everyone thank ${trivStartUser} for the trivia round! \`\`\`markdown\r\n# TRIVIA STOPPED!\`\`\``).then(() => {
				getLB(channel, "**Final Standings:**", 9);
				cooldown(cmd);
			});
		}
	}, time);
}

var timedScramble = (channel, minutes, trivStartUser, category, cmd, config) => {
	var time = (minutes*60)*1000;
	toggleScrambleStatus();
	populateScramble();
	channel.sendMessage("```markdown\r\n# Scramble is about to start (" + Math.floor(config.delayBeforeFirstQuestion / 1000) + "s)!\r\nBefore it does, here is some info:\r\n\r\n**Info**\r\n*  Questions are presented in **bold** and you're free to guess as many times as you like until it times out.  \r\n* There are no hints.  \r\n*  There is " + Math.floor(config.delayBeforeNoAnswer / 1000) + "s between scramble and timeout, and " + Math.floor(config.delayBeforeNextQuestion / 1000) + "s between timeout and next question.  \r\n\r\n**Commands**\r\n*  You can use the \"!score\" command to view your current scoreboard rank and score.  \r\n*  You can use \"!score board\" to view the current top players.  \r\n*  You can also use \"!score @mention\" to view that specific player's rank and score.```");
	setTimeout(goScramble, config.delayBeforeFirstQuestion, channel, -1, category, config);
	setTimeout(function() {
		if (triviaOn) {
			toggleScrambleStatus();
			channel.sendMessage(`Everyone thank ${trivStartUser} for the scramble round! \`\`\`markdown\r\n# SCRAMBLE STOPPED!\`\`\``).then(() => {
				getLB(channel, "**Final Standings:**", 9);
				cooldown(cmd);
			});
		}
	}, time);
};

module.exports = {
	populateQuestions,
	getLB,
	goTrivia,
	timedTrivia,
	toggleTriviaStatus,
	toggleScrambleStatus,
	getTriviaStatus,
	getScrambleStatus,
	goScramble,
	timedScramble,
	populateScramble
};
