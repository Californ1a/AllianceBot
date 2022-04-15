//const pre = require("../config.json").prefix;
const parseString = require("xml2js").parseString;
const checkMapID = require("../util/checkMapIDs.js");
// const ids = require("../mapids.json");
const send = require("../util/sendMessage.js");
const Steam = require("steam-web");
const fetch = require("node-fetch");
const s = new Steam({
	apiKey: process.env.STEAM_API_KEY,
	format: "json"
});

const fetchBoard = (server) => {
	return new Promise((resolve, reject) => {
		fetch(server).then(res => {
			return res.text();
		}).then(body => {
			parseString(body, function(error, result) {
				if (error) {
					reject(error);
				}
				resolve(result.response);
			});
		}).catch(err => reject(err));
	});
};

exports.run = (bot, msg, args) => {
	const pre = bot.servConf.get(msg.channel.guild.id).prefix;
	if (typeof args[0] !== "string") {
		send(msg.channel, `Incorrect syntax. Use \`${pre}help dist\` for syntax help.`);
	} else {
		const mapInfo = checkMapID(args);
		const mapid = mapInfo.id;
		if (mapid === 0) {
			send(msg.channel, `Incorrect syntax. Use \`${pre}help dist\` for syntax help.`);
		} else if (typeof mapid === "string" && mapid !== "") {
			const lburl = `http://steamcommunity.com/stats/233610/leaderboards/${mapid}`;
			send(msg.channel, "Loading board...").then((m) => {
				const server = `${lburl}/?xml=1&start=1&end=1`;
				fetchBoard(server).then((response) => {
					if (!response.entries) {
						return m.edit("No entries found.");
					} else {
						m.edit(`<${lburl}>`);
					}
					let fulltime = "";
					const sometest = response.entries[0].entry[0].score;
					const somesteamid = response.entries[0].entry[0].steamid.toString();
					const working = parseInt(sometest.toString(), 10);
					let checkForStunt = false;
					if (mapInfo.mode === "stunt") {
						checkForStunt = true;
					}
					if (!checkForStunt) {
						const wrmin = ((working / 1000) / 60) >> 0;
						let wrsec = (working / 1000) - (wrmin * 60) >> 0;
						let wrmil = (working / 1000).toFixed(2).split(".");
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
							const name = data.response.players[0].personaname;
							send(msg.channel, `${fulltime} by ${name}`);
							//console.log("data.response.players[0].personaname", data.response.players[0].personaname);
						}
					});
				});
			});
		} else {
			send(msg.channel, "No data found.");
		}
	}
};

exports.conf = {
	guildOnly: true,
	aliases: ["d"],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "dist",
	description: "Displays current #1 on the specified map.",
	extendedDescription: "<map name>\n* The name of the map. Only official maps are supported, no workshop. Abbreviations and full names are both supported (`ttam` = `machines` = `the thing about machines`).\n\n[mode]\n* The mode. This is only necessary when requesting a Speed and Style map (it will default to Sprint because they have the same name, however S&S is currently not supported because the map IDs aren't listed on Steam). Abbreviations for modes is also supported (`speed and style` = `speed` = `sas` = `s&s` | `sprint` = `s`)\n\n= Examples =\n\"dist bs\" or \"dist broken symmetry\" :: Both would return the best time for Broken Symmetry in Sprint mode.",
	usage: "dist <map> [mode]"
};
