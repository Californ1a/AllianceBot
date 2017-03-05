const game = require("./games.js");
const connection = require("./connection.js");
const colors = require("colors");
var scrambleOn = false;
var incompleteQuestions = [];
var countQsMissed = 0;
var scoreAdd = 0;
var events = require("events");
var eventEmitter = new events.EventEmitter();

var getScrambleStatus = () => {
	return scrambleOn;
};

var populateScramble = () => {
	delete require.cache[require.resolve("../gameconfigs/scramble.json")];
	incompleteQuestions = require("../gameconfigs/scramble.json").filter(v => v !== "");
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
	if (ret.charAt(0) === " " || ret.charAt(ret.length - 1) === " " || ret.includes("  ") || ret === a) {
		ret = scramble(a);
	}
	return ret;
}

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
	orig = game.getRndmFromSet(incompleteQuestions);
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
			eventEmitter.emit("manageScrambleCorrect", channel, collected, winnerid, scoreAdd, config, orig);
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

eventEmitter.on("manageScrambleCorrect", (channel, collected, winnerid, scoreAdd, config, orig) => {
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
});

var timedScramble = (channel, minutes, trivStartUser, category, cmd, config, startingScores) => {
	var time = (minutes * 60) * 1000;
	toggleScrambleStatus();
	populateScramble();
	channel.sendMessage("```markdown\r\n# Scramble is about to start (" + Math.floor(config.delayBeforeFirstQuestion / 1000) + "s)!\r\nBefore it does, here is some info:\r\n\r\n**Info**\r\n*  Terms are presented in **bold** and you're free to guess as many times as you like until it times out.  \r\n* There are no hints.  \r\n*  There is " + Math.floor(config.delayBeforeNoAnswer / 1000) + "s between scramble and timeout, and " + Math.floor(config.delayBeforeNextQuestion / 1000) + "s between timeout and next question.  \r\n\r\n**Commands**\r\n*  You can use the \"!score\" command to view your current scoreboard rank and score.  \r\n*  You can use \"!score board\" to view the current top players.  \r\n*  You can also use \"!score @mention\" to view that specific player's rank and score.```");
	setTimeout(goScramble, config.delayBeforeFirstQuestion, channel, -1, category, config);
	setTimeout(function() {
		if (getScrambleStatus()) {
			toggleScrambleStatus();
			channel.sendMessage(`Everyone thank ${trivStartUser} for the scramble round! \`\`\`markdown\r\n# SCRAMBLE STOPPED!\`\`\``).then(() => {
				game.getChanges(channel, startingScores, "**Final Standings:**", 9);
				game.cooldown(cmd);
			});
		}
	}, time);
};

module.exports = {
	getScrambleStatus,
	populateScramble,
	toggleScrambleStatus,
	timedScramble,
	goScramble
};
