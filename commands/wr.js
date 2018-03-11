const http = require("http");
const send = require("../util/sendMessage.js");

exports.run = (bot, msg, args) => {
	if (typeof args[0] === "string") {
		let str = msg.content.toString();
		str = str.substr(str.indexOf(" ") + 1);
		str = str.toLowerCase().split(" ");
		let i = 0;
		for (i; i < str.length; i++) {
			str[i] = str[i].split("");
			str[i][0] = str[i][0].toUpperCase();
			str[i] = str[i].join("");
		}
		const category = str.join(" ");
		let gamename = "";
		if (msg.guild.name === "Cali Test Server") {
			gamename = "Antichamber";
		} else {
			gamename = msg.guild.name;
		}
		let nonefound = true;
		const optionsac = {
			hostname: "www.speedrun.com",
			path: `/api_records.php?game=${gamename}`,
			method: "GET",
			json: true
		};
		http.request(optionsac, function(respond) {
			let str = "";
			respond.on("data", function(chunk) {
				str += chunk;
			});
			respond.on("end", function() {
				const actable = JSON.parse(str)[gamename];
				for (const key in actable) {
					if (actable.hasOwnProperty(key)) {
						if (key.indexOf(category) > -1) {
							if (nonefound) {
								const sometime = actable[key].time;
								const working = parseFloat(sometime.toString());
								const wrmin = (working / 60) >> 0;
								let wrsec = working - (wrmin * 60) >> 0;
								let wrmil = working.toFixed(2).split(".");
								wrmil = wrmil[1];
								if (wrsec < 10) {
									wrsec = `0${wrsec}`;
								}
								if (typeof actable[key].video !== "string") {
									send(msg.channel, `${wrmin}:${wrsec}.${wrmil} by ${actable[key].player}: No video found.`);
									nonefound = false;
								} else {
									send(msg.channel, `${wrmin}:${wrsec}.${wrmil} by ${actable[key].player}: ${actable[key].video}`);
									nonefound = false;
								}
							}
						}
					}
				}
				if (nonefound) {
					send(msg.channel, "No record found for the given category.");
					nonefound = true;
				}
			});
		}).end();
	} else {
		send(msg.channel, "Incorrect syntax, category name required.");
	}
};

exports.conf = {
	guildOnly: true,
	aliases: [],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "wr",
	description: "Get the Speedrun.com WR for the given category.",
	extendedDescription: "",
	usage: "wr <category>"
};
