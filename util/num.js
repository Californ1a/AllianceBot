const connection = require("./connection.js");
var numOn = false;

var toggleStatus = function() {
	numOn = !numOn;
};

var getStatus = function() {
	return numOn;
};

var manageCorrect = function(channel, collected, winnerid, scoreAdd) {
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
		channel.sendMessage(`${collected.first().author} guessed correctly (+${scoreAdd})! Your score is now ${score}.`).then(() => {
			toggleStatus();
		});
	}).catch(e => {
		return console.error(e.stack);
	});
};

module.exports = {
	toggleStatus,
	getStatus,
	manageCorrect
};
