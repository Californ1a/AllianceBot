const colors = require("colors");

module.exports = (bot, response) => {
	console.log(colors.red(`Twitter stream connected: ${response.request.method}`));
};
