const connection = require("./connection.js");
const send = require("./sendMessage.js");
let numOn = false;

const toggleStatus = function() {
	numOn = !numOn;
};

const getStatus = function() {
	return numOn;
};

const manageCorrect = function(channel, collected, winnerid, scoreAdd) {
	let score;
	connection.select("*", "triviascore", `userid=${winnerid} AND server_id='${channel.guild.id}' LIMIT 1`).then(response => {
		if (response[0]) {
			score = response[0].score + scoreAdd;
			connection.update("triviascore", `score=${score}`, `userid='${winnerid}' AND server_id='${channel.guild.id}'`).catch(e => console.error(e.stack));
		} else {
			score = scoreAdd;
			const info = {
				"userid": winnerid,
				"score": scoreAdd,
				"server_id": channel.guild.id
			};
			connection.insert("triviascore", info).catch(e => console.error(e.stack));
		}
		send(channel, `${collected.first().author} guessed correctly (+${scoreAdd})! Your score is now ${score}.`).then(() => {
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
