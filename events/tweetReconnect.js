const colors = require("colors");

module.exports = (bot, request, response, connectInterval) => {
	console.log(colors.red(`Twitter stream attemptng reconnect in ${connectInterval}ms.`));
};
