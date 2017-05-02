const http = require("http");
const pre = require("../config.json").prefix;
const parseString = require("xml2js").parseString;
const checkMapID = require("../util/checkMapIDs.js").checkMapID;
const jsondata = require("../mapids.json");
const send = require("../util/sendMessage.js");
const Steam = require("steam-web");
const s = new Steam({
	apiKey: process.env.STEAM_API_KEY,
	format: "json"
});

exports.run = (bot, msg, args) => {
	if (typeof args[0] !== "string") {
		send(msg.channel, `Incorrect syntax. Use \`${pre}help dist\` for syntax help.`);
	} else {
		var mapid = checkMapID(msg, args);
		if (mapid === 0) {
			send(msg.channel, `Incorrect syntax. Use \`${pre}help dist\` for syntax help.`);
		} else if (typeof mapid === "string" && mapid !== "") {
			var lburl = `<http://steamcommunity.com/stats/233610/leaderboards/${mapid}>`;
			send(msg.channel, lburl);
			var optionsac = {
				hostname: "steamcommunity.com",
				path: `/stats/233610/leaderboards/${mapid}/?xml=1&start=1&end=1`,
				method: "GET",
			};
			http.request(optionsac, function(respond) {
				var str = "";
				respond.on("data", function(chunk) {
					str += chunk;
				});
				respond.on("end", function() {
					if (!str || str === "") {
						send(msg.channel, "No data received.");
						console.log("No data received.");
						return;
					}
					parseString(str, function(error, result) {
						if (error) {
							console.error(error.stack);
							return;
						}
						var fulltime = "";
						var sometest = result.response.entries[0].entry[0].score;
						var somesteamid = result.response.entries[0].entry[0].steamid.toString();
						var working = parseInt(sometest.toString(), 10);
						var checkForStunt = false;
						Object.keys(jsondata.officialmapids["Stunt"]).forEach(function(key) {
							if (mapid === jsondata.officialmapids["Stunt"][key]) {
								checkForStunt = true;
							}
						});
						if (!checkForStunt) {
							var wrmin = ((working / 1000) / 60) >> 0;
							var wrsec = (working / 1000) - (wrmin * 60) >> 0;
							var wrmil = (working / 1000).toFixed(2).split(".");
							wrmil = wrmil[1];
							if (wrsec < 10) {
								wrsec = `0${wrsec}`;
							}
							fulltime = `${wrmin}:${wrsec}.${wrmil}`;
						} else {
							fulltime = working.toLocaleString("en-US", {
								minimumFractionDigits: 0
							});
						}
						s.getPlayerSummaries({
							steamids: [`${somesteamid}`],
							callback: (err, data) => {
								var name = data.response.players[0].personaname;
								send(msg.channel, `${fulltime} by ${name}`);
								//console.log("data.response.players[0].personaname", data.response.players[0].personaname);
							}
						});
						//begin convert steamid64 to profile name
						// var optionsac2 = {
						// 	hostname: "steamcommunity.com",
						// 	path: `/profiles/${somesteamid}/?xml=1`,
						// 	method: "GET",
						// };
						// http.request(optionsac2, function(response) {
						// 	var str2 = "";
						// 	response.on("data", function(chunk) {
						// 		str2 += chunk;
						// 	});
						// 	response.on("end", function() {
						// 		parseString(str2, function(error, result2) {
						// 			if (error) {
						// 				console.error(error.stack);
						// 				return;
						// 			}
						// 			var profilename = result2.profile.steamID.toString();
						// 			send(msg.channel, `${fulltime} by ${profilename}`);
						// 		});
						// 	});
						// }).end();
					});
				});
			}).end();
		} else {
			send(msg.channel, "No data found.");
		}
	}
};

exports.conf = {
	guildOnly: false,
	aliases: ["d"],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "dist",
	description: "Displays current #1 on the specified map.",
	extendedDescription: `<map name>\n* The name of the map. Only official maps are supported, no workshop. Abbreviations and full names are both supported (\`ttam\` = \`machines\` = \`the thing about machines\`).\n\n[mode]\n* The mode. This is only necessary when requesting a Speed and Style map (it will default to Sprint because they have the same name, however S&S is currently not supported because the map IDs aren't listed on Steam). Abbreviations for modes is also supported (\`speed and style\` = \`speed\` = \`sas\` = \`s&s\` | \`sprint\` = \`s\`)\n\n= Examples =\n"${pre}dist bs" or "${pre}dist broken symmetry" :: Both would return the best time for Broken Symmetry in Sprint mode.`,
	usage: "dist <map> [mode]"
};
