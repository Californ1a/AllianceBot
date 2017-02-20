const colors = require("colors");

module.exports = (bot, request) => {
	console.log(colors.red(`Twitter stream connection attempt: ${request.method}`));
};
