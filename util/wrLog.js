const {
	MessageEmbed
} = require("discord.js");
const colors = require("colors");
const fetch = require("node-fetch");
const parse = require("parse-duration");
const Duration = require("duration-js");
const moment = require("moment");
const {
	URLSearchParams
} = require("url");
const firebase = require("./firebase.js");
const send = require("./sendMessage.js");
const url = "http://seekr.pw/distance-log/changelist.json";
const guildID = (process.env.NODE_ENV === "dev") ? "211599888222257152" : "83078957620002816";
const channelID = (process.env.NODE_ENV === "dev") ? "223774050537832449" : "551229266336022559";
const refreshMin = 5;
let sending = false;

let wrMsgs = {};
firebase.db.ref("wrlog").once("value").then(data => {
	if (data.val()) {
		// console.log("[CAL] wrlog firebase", data.val());
		wrMsgs = JSON.parse(JSON.stringify(data.val()));
	}
});

function saveToFirebase(wr) {
	// console.log("[CAL] Save to firebase", wr);
	if (wr.mostRecentWR) {
		if (process.env.NODE_ENV !== "dev") {
			firebase.db.ref("wrlog").set(wr);
		}
		wrMsgs = wr;
	} else {
		if (process.env.NODE_ENV !== "dev") {
			firebase.db.ref("wrlog/fetchTime").set(wr.fetchTime);
		}
		wrMsgs.fetchTime = wr.fetchTime;
	}
}

function readableTime(time) {
	let dur = new Duration(time);

	const h = dur.hours();
	const hours = (h !== 0) ? `${h}:` : "";
	dur = new Duration(dur - Duration.parse(`${h}h`));

	const m = dur.minutes();
	const minutes = (m !== 0) ? (m >= 10) ? `${m}:` : (h !== 0) ? `0${m}:` : `${m}:` : (h !== 0) ? "00:" : "";
	dur = new Duration(dur - Duration.parse(`${m}m`));

	const s = dur.seconds();
	const seconds = (s !== 0) ? (s >= 10) ? `${s}.` : (m !== 0) ? `0${s}.` : `${s}.` : (m === 0 && h === 0) ? "0." : "00.";
	dur = new Duration(dur - Duration.parse(`${s}s`));

	const ms = dur.milliseconds();
	const milliseconds = (ms !== 0) ? (ms >= 10) ? (ms >= 100) ? `${ms}` : `0${ms}` : `00${ms}` : "000";
	return `${hours}${minutes}${seconds}${milliseconds.slice(0, milliseconds.length-1)}${(minutes==="")?"s":""}`;
}

function getDiff(mode, oldTime, newTime) {
	let diff = null;
	if (mode !== "Stunt") {
		const tempRegex = /^(\d{2}):(\d{2}):(\d{2})\.(\d{2})$/gi;
		const tempRepl = "$1h $2m $3s $40ms";
		let tempOldTime = oldTime;
		let tempNewTime = newTime;
		if (!oldTime) {
			tempOldTime = newTime;
			tempNewTime = "00:00:00.00";
		}
		diff = parse(tempOldTime.replace(tempRegex, tempRepl)) - parse(tempNewTime.replace(tempRegex, tempRepl));
		diff = readableTime(diff);
	} else if (mode === "Stunt") {
		let tempOldTime = oldTime;
		if (!oldTime) {
			tempOldTime = "0";
		}
		diff = parseInt(newTime.split(",").join("")) - parseInt(tempOldTime.split(",").join(""));
		diff = diff.toLocaleString();
	}
	return diff;
}

function parseMapData(t) {
	const mode = t.mode;
	const author = (t.map_author) ? t.map_author : "[Official Map]";
	let oldTime = t.record_old;
	let newTime = t.record_new;

	const diff = getDiff(t.mode, oldTime, newTime);
	if (mode !== "Stunt") {
		const tempRegex = /^(\d{2}):(\d{2}):(\d{2})\.(\d{2})$/gi;
		const tempRepl = "$1h $2m $3s $40ms";
		if (oldTime) {
			oldTime = readableTime(oldTime.replace(tempRegex, tempRepl));
		}
		newTime = readableTime(newTime.replace(tempRegex, tempRepl));
	}
	return {
		fetchTime: t.fetchTime,
		map: t.map_name,
		workshopID: t.workshop_item_id,
		author,
		authorProfileUrl: `https://steamcommunity.com/profiles/${t.steam_id_author}`,
		mapUrl: `https://steamcommunity.com/workshop/filedetails/?id=${t.workshop_item_id}`,
		mapThumbnailUrl: t.map_preview,
		mode,
		newRecordHolderProfileUrl: `https://steamcommunity.com/profiles/${t.steam_id_new_recordholder}`,
		newRecordHolderName: t.new_recordholder,
		oldRecordHolderProfileUrl: `https://steamcommunity.com/profiles/${t.steam_id_old_recordholder}`,
		oldRecordHolderName: t.old_recordholder,
		oldTime,
		newTime,
		diff
	};
}

function getTimeDiff(a, b) {
	const tempOldFetchTime = new Date(a);
	const oldFetchTime = tempOldFetchTime.getTime();
	const tempNewFetchTime = new Date(b);
	const newFetchTime = tempNewFetchTime.getTime();

	const d3 = newFetchTime - oldFetchTime;
	return moment.duration(d3).humanize({
		d: 36500000
	});
}

async function getStoodFor(d, json) {
	let standDuration;
	let txt;
	try {
		if (d.oldTime) {
			const matches = [];
			for (let i = json.length - 1; i >= 0; i--) {
				if ((d.workshopID && json[i].workshop_item_id !== d.workshopID) ||
					(!d.workshopID && (json[i].map_name !== d.map || json[i].map_author)) || d.mode !== json[i].mode) {
					continue;
				} else if (((d.workshopID && json[i].workshop_item_id === d.workshopID && d.mode === json[i].mode) ||
						(!d.workshopID && d.map === json[i].map_name && d.mode === json[i].mode && !json[i].map_author)) &&
					matches.length < 2) {
					matches.push(json[i]);
					if (matches.length >= 2) {
						break;
					}
				}
			}

			// console.log(matches);
			if (matches.length > 1) {
				txt = "Stood";
				standDuration = getTimeDiff(matches[1].fetch_time, matches[0].fetch_time);
			}
		} else if (!d.oldTime && d.workshopID) {
			txt = "Unbeaten";
			const params = new URLSearchParams({
				itemcount: "1",
				"publishedfileids[0]": d.workshopID
			});
			const detailsUrl = `https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/?${params}`;
			console.log(`Fetching map details: ${colors.green(detailsUrl)}`);
			const res = await fetch(detailsUrl, {
				method: "POST",
				body: params,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"Cache-Control": "no-cache",
					Authorization: `Bearer ${process.env.STEAM_API_TOKEN}`
				}
			});
			const j = await res.json();
			// console.log("j", j);
			// console.log("d", d);
			const createdTime = j.response.publishedfiledetails[0].time_created;
			standDuration = getTimeDiff(createdTime * 1000, d.fetchTime);
		}
		if (standDuration) {
			return `${txt} for: \`${standDuration}\``;
		} else {
			return null;
		}
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function composeEmbed(d, json) {

	const stoodFor = await getStoodFor(d, json);

	const embed = new MessageEmbed()
		.setTitle(d.map)
		.setDescription(`${(d.author === "[Official Map]") ? d.author : (d.authorProfileUrl) ? `Author: [${(d.author)?d.author:"[unknown]"}](${d.authorProfileUrl})` : `Author: ${(d.author)?d.author:"[unknown]"}`}\nMode: \`${d.mode}\`${(stoodFor)?`\n${stoodFor}`:""}\n${(d.mode==="Stunt")?"Score":"Time"} improved by \`${d.diff}\``)
		.setColor(4886754)
		.setAuthor({
			name: "WR Log",
			iconURL: "https://images-ext-1.discordapp.net/external/PpvdQjaWNtfE0GpMoI2UjilPY2gIp-KgEKY-WHnbSg8/https/cdn.discordapp.com/emojis/230369859920330752.png",
			url: "http://seekr.pw/distance-log/"
		})
		.addField("Old WR", (d.oldTime) ? `${d.oldTime} by ${(d.oldRecordHolderProfileUrl)?`[${(d.oldRecordHolderName)?d.oldRecordHolderName:"[unknown]"}](${d.oldRecordHolderProfileUrl})`:(d.oldRecordHolderName)?d.oldRecordHolderName:"[unknown]"}` : "None", true)
		.addField("New WR", `${d.newTime} by ${(d.newRecordHolderProfileUrl)?`[${(d.newRecordHolderName)?d.newRecordHolderName:"[unknown]"}](${d.newRecordHolderProfileUrl})`:(d.newRecordHolderName)?d.newRecordHolderName:"[unknown]"}`, true);
	if (d.author !== "[Official Map]") {
		embed.setThumbnail(d.mapThumbnailUrl);
		embed.setURL(d.mapUrl);
	}
	return embed;
}

async function embedSendManager(data, chan, json) {
	try {
		const embeds = await Promise.all(data.map(async wr => await composeEmbed(wr, json)));
		// console.log(embeds);
		// for await (const embed of embeds) {
		// 	await send(chan, "New record!", embed);
		// }
		// console.log("embeds", embeds);
		return await Promise.all(embeds.map(async (e) => await send(chan, {
			content: "New record!",
			embeds: [e]
		})));
	} catch (e) {
		console.error(e);
	}
}

async function wrLog(bot) {
	try {
		const res = await fetch(url);
		const json = await res.json();
		// console.log("test", json.slice(-5));
		const mostRecentWR = json[json.length - 1];
		const fetchTimeWR = new Date(mostRecentWR.fetch_time);
		mostRecentWR.fetchTime = fetchTimeWR.getTime();

		if (wrMsgs && wrMsgs.fetchTime && wrMsgs.fetchTime < mostRecentWR.fetchTime) {
			const newWRs = [];

			// filter option - needs to check every entry
			// json.filter((wr) => {
			// 	const fetchTime = new Date(wr.fetch_time);
			// 	const d = fetchTime.getTime();
			// 	return (d > wrMsgs.fetchTime);
			// });

			// for loop option - start at newest and stop checking entries when they no longer match
			for (let i = json.length - 1; i >= 0; i--) {
				const d = new Date(json[i].fetch_time);
				if (d.getTime() > wrMsgs.fetchTime) {
					json[i].fetchTime = d.getTime();
					newWRs.unshift(json[i]);
				} else {
					break;
				}
			}

			console.log(colors.grey(`* Found ${newWRs.length} new WRs, sending messages...`));
			const mapData = newWRs.map(wr => parseMapData(wr));
			const chan = bot.guilds.cache.get(guildID).channels.cache.get(channelID);
			await embedSendManager(mapData, chan, json);

			// console.log("newWRs", JSON.stringify(newWRs, null, 2));
			const defaultMsg = {
				fetchTime: mostRecentWR.fetchTime,
				mostRecentWR
			};
			saveToFirebase(defaultMsg);
			console.log(colors.grey(`* Sent ${newWRs.length} new WR messages.`));

		} else if (!wrMsgs || !wrMsgs.fetchTime || !wrMsgs.mostRecentWR) {
			// seed firebase if it has no entry for wrs
			const defaultMsg = {
				fetchTime: mostRecentWR.fetchTime,
				mostRecentWR
			};
			saveToFirebase(defaultMsg);
			console.log(colors.grey("* No new WRs"));
		} else {
			// no need to save to db if nothing has changed
			console.log(colors.grey("* No new WRs"));
		}
		sending = false;
		return;
	} catch (e) {
		sending = false;
		console.error(e);
	}
}

async function interval(bot) {
	console.log(colors.grey("* Checking for new WRs..."));
	if (!sending) {
		try {
			sending = true;
			await wrLog(bot);
		} catch (e) {
			console.error(e);
		}
	}
	setTimeout(() => {
		interval(bot);
	}, refreshMin * 60 * 1000);
}

module.exports = interval;
