const colors = require("colors");
const Duration = require("duration-js");
const connection = require("./connection.js");
const manageTimeout = require("./manageTimeout.js");

module.exports = (bot) => {
	connection.query("select * from timeout inner join servers on timeout.server_id=servers.serverid").then(to => {
		if (to[0]) {
			console.log(colors.red("Checking timeouts"));
			const now = Date.now();
			let enddateMS;
			let remainingMS;
			let i = 0;
			for (i; i < to.length; i++) {
				enddateMS = to[i].enddate.getTime();
				remainingMS = (enddateMS - now > 0) ? (enddateMS - now) : 1000;
				bot.guilds.forEach(g => {
					const memberTest = g.members.get(to[i].memberid);
					if (memberTest && g.id === to[i].server_id) {
						const timeoutData = to[i];
						const toTimer = setTimeout(function() {
							manageTimeout(memberTest, bot, g.roles.find(val => val.name === timeoutData.timeoutrole), timeoutData.server_id);
						}, new Duration(`${remainingMS}ms`));
						bot.timer.set(to[i].memberid, toTimer);
					}
				});
			}
			console.log(colors.red("Done checking timeouts"));
		} else {
			console.log(colors.red("No timeouts to check"));
		}
	});
};
