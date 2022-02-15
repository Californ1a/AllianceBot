// const fs = require("fs-extra");
require("colors");
const cl = require("../util/chatinfo.js");
const jsdiff = require("diff");

function printDiff(oldMsg, newMsg) {
	const diff = jsdiff.diffWords(oldMsg, newMsg);

	let edit = "Edited --> ".grey;

	diff.forEach(part => {
		const color = (part.added) ? "green" : (part.removed) ? "red" : "grey";
		edit += part.value[color];
	});

	console.log(edit);
}

module.exports = async (bot, oldMessage, newMessage) => {
	if (bot.user === oldMessage.author || bot.user === newMessage.author) {
		return;
	}
	if (oldMessage.content === newMessage.content) {
		return;
	}
	if (!newMessage.guild || !oldMessage.guild) {
		const oldM = `(Private) ${oldMessage.author.username}: ${oldMessage.cleanContent}`;
		const newM = `(Private) ${newMessage.author.username}: ${newMessage.cleanContent}`;
		printDiff(oldM, newM);
		return;
	}

	const newc = await cl.formatChatlog(newMessage);
	const oldc = await cl.formatChatlog(oldMessage);

	printDiff(oldc.chatlinedata, newc.chatlinedata);
};
