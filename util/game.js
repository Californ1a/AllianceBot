const trivia = require("./trivia.js");
const game = require("./games.js");
const scramble = require("./scramble.js");

module.exports = {
	getLB: game.getLB,
	cooldown: game.cooldown,
	getChanges: game.getChanges,
	trivia: {
		getStatus: trivia.getTriviaStatus,
		populateQ: trivia.populateQuestions,
		toggleStatus: trivia.toggleTriviaStatus,
		go: trivia.goTrivia,
		timed: trivia.timedTrivia
	},
	scramble: {
		getStatus: scramble.getScrambleStatus,
		populateQ: scramble.populateScramble,
		toggleStatus: scramble.toggleScrambleStatus,
		go: scramble.goScramble,
		timed: scramble.timedScramble
	}
};
