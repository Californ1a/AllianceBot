const colors = require("colors");
module.exports = closeEvent => {
	console.log(colors.red(`Bot disconnected from server with status code ${closeEvent.code}.`));
	console.log(`Reason: ${closeEvent.reason}`);
};
