const game = require("./games.js");
//const connection = require("./connection.js");
const colors = require("colors");
const sm = require("./scoremanager.js");
const send = require("./sendMessage.js");
var scrambleOn = false;
var incompleteQuestions = [];
var countQsMissed = 0;
var scoreAdd = 0;
var events = require("events");
var eventEmitter = new events.EventEmitter();
var timeout;

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

var goScramble = (channel, config, startingScores) => {
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
	send(channel, `Term:\n**${curr.toUpperCase()}**`).then(() => {
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
			send(channel, "No one guessed correctly!").then(() => {
				if (countQsMissed < config.maxUnansweredQuestionsBeforeAutoStop) {
					removeScrambleTerm(orig);
					setTimeout(goScramble, config.delayBeforeNextQuestion, channel, config);
				} else {
					send(channel, "Scramble has been automatically stopped.");
					if (startingScores) {
						game.getChanges(channel, startingScores, "**Final Standings:**", 9);
					}
					toggleScrambleStatus();
				}
			});
		});
	}).catch(e => console.error(e.stack));
};

eventEmitter.on("manageScrambleCorrect", (channel, collected, winnerid, scoreAdd, config, orig) => {
	var member = channel.guild.members.get(winnerid);
	sm.setScore(channel.guild, member, "add", scoreAdd).then(m => {
		removeScrambleTerm(orig);
		countQsMissed = 0;
		send(channel, `${collected.first().author} guessed correctly (+${scoreAdd})! ${(m.message.startsWith("Set"))?`Your score is now ${m.score}`:`You have been added to the board with a score of ${m.score}`}.`).then(() => {
			setTimeout(goScramble, config.delayBeforeNextQuestion, channel, config);
		});
	}).catch(e => console.error(e.stack));
});

var timedScramble = (channel, minutes, trivStartUser, category, cmd, config, startingScores) => {
	var time = (minutes * 60) * 1000;
	toggleScrambleStatus();
	populateScramble();
	send(channel, "```markdown\r\n# Scramble is about to start (" + Math.floor(config.delayBeforeFirstQuestion / 1000) + "s)!\r\nBefore it does, here is some info:\r\n\r\n**Info**\r\n*  Terms are presented in **bold** and you're free to guess as many times as you like until it times out.  \r\n* There are no hints.  \r\n*  There is " + Math.floor(config.delayBeforeNoAnswer / 1000) + "s between scramble and timeout, and " + Math.floor(config.delayBeforeNextQuestion / 1000) + "s between timeout and next question.  \r\n\r\n**Commands**\r\n*  You can use the \"!score\" command to view your current scoreboard rank and score.  \r\n*  You can use \"!score board\" to view the current top players.  \r\n*  You can also use \"!score @mention\" to view that specific player's rank and score.```");
	setTimeout(goScramble, config.delayBeforeFirstQuestion, channel, config, startingScores);
	timeout = setTimeout(function() {
		if (getScrambleStatus()) {
			toggleScrambleStatus();
			send(channel, `Everyone thank ${trivStartUser} for the scramble round! \`\`\`markdown\r\n# SCRAMBLE STOPPED!\`\`\``).then(() => {
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
	goScramble,
	timeout
};
