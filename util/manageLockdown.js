const Duration = require("duration-js");
const connection = require("./connection.js");
const send = require("./sendMessage.js");

module.exports = (g, lockdownData, channelTest) => {
	const roles = [];
	roles.push(g.roles.cache.find(val => val.name === "@everyone"));
	if (lockdownData.role_id) {
		roles.push(g.roles.cache.get(lockdownData.role_id));
	}
	for (const r of roles) {
		channelTest.updateOverwrite(r, {
			"SEND_MESSAGES": null
		}, "Revert channel lockdown").catch(console.error);
	}
	channelTest.locked = false;
	channelTest.timeoutRoles = [];
	connection.del("lockdown", `channel_id=${channelTest.id} AND server_id=${g.id}`).catch(console.error);
	const now = new Date();
	const d = new Duration(now - lockdownData.startdate);
	send(channelTest, `Channel unlocked after ${d.toString()} of lockdown.`).catch(console.error);
};
