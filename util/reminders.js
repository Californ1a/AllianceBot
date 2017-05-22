const connection = require("./connection.js");
const colors = require("colors");
const reminderCheckTime = require("../config.json").reminders;
const send = require("./sendMessage.js");
var events = require("events");
var eventEmitter = new events.EventEmitter();

var refresh = (bot) => {
	return new Promise((resolve, reject) => {
		bot.reminders.clear();
		connection.select("*", "reminders").then(response => {
			var i = 0;
			for (i; i < response.length; i++) {
				bot.reminders.set(response[i].id, response[i]);
			}
			//console.log("bot, reminders", bot.reminders);
			// console.log("response[0].reminddate.getTime()", response[0].reminddate.getTime());
			// console.log("Date.now()", Date.now());
			// console.log("response[0].reminddate.getTime() - Date.now()", response[0].reminddate.getTime() - Date.now());
			console.log(colors.red("Refreshed reminders"));
			resolve();
		}).catch(e => {
			if (e.code === "ER_NO_SUCH_TABLE") {
				connection.query("CREATE TABLE reminders (id INT(11) NOT NULL AUTO_INCREMENT, userid VARCHAR(50) NOT NULL, message TEXT NOT NULL, sent VARCHAR(5) NOT NULL DEFAULT 'false', reminddate DATETIME NOT NULL, initdate DATETIME NOT NULL, INDEX id (id)) COLLATE='utf8mb4_general_ci' ENGINE=InnoDB").then(() => {
					refresh(bot);
				}).catch(e => reject(e));
			} else {
				reject(e);
			}
		});
	});
};

// ------ Attempt at making the delete and refresh wait after consecutive reminders
// var count = 0;
// var delTimer = (bot) => {
// 	console.log("deltimer");
// 	if (count > 0) {
// 		console.log("count", count);
// 		count--;
// 		setTimeout(() => {
// 			delTimer(bot);
// 		}, 1000);
// 	} else {
// 		console.log("we outside");
// 		count = 0;
// 		var d = Date.now();
// 		var delCount = 0;
// 		bot.reminders.forEach(reminder => {
// 			//console.log("reminder", reminder);
// 			if (reminder.reminddate.getTime() <= d) {
// 				connection.del("reminders", `id=${reminder.id}`);
// 				delCount++;
// 			}
// 		});
// 		if (delCount > 0) {
// 			refresh(bot);
// 		}
// 	}
// };

var reminderEmitter = (bot) => {
	var d = Date.now();
	bot.reminders.forEach(reminder => {
		//console.log("reminder", reminder);
		if (reminder.reminddate.getTime() <= d) {
			//count++;
			eventEmitter.emit("remindTime", bot, reminder);
		}
	});
	//delTimer(bot);
	setTimeout(() => {
		reminderEmitter(bot);
	}, reminderCheckTime * 60 * 1000);
};

eventEmitter.on("remindTime", (bot, reminder) => {
	connection.del("reminders", `id=${reminder.id}`).then(() => {
		refresh(bot);
	}).then(() => {
		if (reminder.sent === "false") {
			//console.log("reminder (before send)", reminder);
			let strs = reminder.message;
			let results = strs.slice(1, strs.length - 1);
			send(bot.users.get(reminder.userid), `Reminding you soon after ${reminder.reminddate.toString()} about:\n${results}\n\nYou set this reminder at: ${reminder.initdate.toString()}`);
			reminder.sent = "true";
			//console.log("reminder (after send)", reminder);
		}
	}).catch(console.error);
});

module.exports = {
	refresh,
	reminderEmitter
};
