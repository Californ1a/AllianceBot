const colors = require("colors");
let count = 0;
module.exports = () => {
	if (count >= 5) {
		process.exit();
	} else {
		console.log(colors.red("Reconnecting..."));
		count++;
	}
};
