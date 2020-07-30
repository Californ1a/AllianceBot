const colors = require("colors");
const Duration = require("duration-js");
const connection = require("./connection.js");
const manageLockdown = require("./manageLockdown.js");

module.exports = (bot) => {
	connection.query("select * from lockdown inner join servers on lockdown.server_id=servers.serverid").then(to => {
		if (to[0]) {
			console.log(colors.red("Checking lockdowns"));
			const now = Date.now();
			let enddateMS;
			let remainingMS;
			let i = 0;
			for (i; i < to.length; i++) {
				enddateMS = to[i].enddate.getTime();
				remainingMS = (enddateMS - now > 0) ? (enddateMS - now) : 1000;
				bot.guilds.cache.forEach(g => {
					const channelTest = g.channels.cache.get(to[i].channel_id);
					if (channelTest && g.id === to[i].server_id) {
						const lockdownData = to[i];
						const d = new Duration(`${remainingMS}ms`);
						// console.log(to);
						const toTimer = setTimeout(function () {
							manageLockdown(g, lockdownData, channelTest);
						}, d);
						bot.timer.lockdown.set(to[i].channel_id, toTimer);
					}
				});
			}
			console.log(colors.red("Done checking lockdowns"));
		} else {
			console.log(colors.red("No lockdowns to check"));
		}
	});
};
