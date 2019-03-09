// const scraper = require("table-scraper");
//const tabletojson = require("tabletojson");
const parse = require("parse-duration");
const Duration = require("duration-js");
const fetch = require("node-fetch");
//const parse5 = require("parse5");
const colors = require("colors");
const {
	RichEmbed
} = require("discord.js");
const send = require("./sendMessage.js");
const serverID = "83078957620002816";
const refreshMin = 5;
let refreshMin2 = refreshMin;

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

// function checkOfficial(author) {
// 	return (author === "[unknown]") ? null : (author === "(official level)") ? "[Official Map]" : author;
// }

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
		map: t.map_name,
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

function embedDataMatch(embed, data) {
	return embed.title === data.map && embed.fields[1].value === `${data.newTime} by ${(data.newRecordHolderProfileUrl)?`[${(data.newRecordHolderName)?data.newRecordHolderName:"[unknown]"}](${data.newRecordHolderProfileUrl})`:(data.newRecordHolderName)?data.newRecordHolderName:"[unknown]"}`;
}

function composeEmbed(d) {
	const embed = new RichEmbed()
		.setTitle(d.map)
		.setDescription(`${(d.author === "[Official Map]") ? d.author : (d.authorProfileUrl) ? `Author: [${(d.author)?d.author:"[unknown]"}](${d.authorProfileUrl})` : `Author: ${(d.author)?d.author:"[unknown]"}`}\nMode: \`${d.mode}\`\n${(d.mode==="Stunt")?"Score":"Time"} improved by \`${d.diff}\``)
		.setColor(4886754)
		.setAuthor("WR Log", "https://images-ext-1.discordapp.net/external/PpvdQjaWNtfE0GpMoI2UjilPY2gIp-KgEKY-WHnbSg8/https/cdn.discordapp.com/emojis/230369859920330752.png", "http://seekr.pw/distance-log/")
		.addField("Old WR", (d.oldTime) ? `${d.oldTime} by ${(d.oldRecordHolderProfileUrl)?`[${(d.oldRecordHolderName)?d.oldRecordHolderName:"[unknown]"}](${d.oldRecordHolderProfileUrl})`:(d.oldRecordHolderName)?d.oldRecordHolderName:"[unknown]"}` : "None", true)
		.addField("New WR", `${d.newTime} by ${(d.newRecordHolderProfileUrl)?`[${(d.newRecordHolderName)?d.newRecordHolderName:"[unknown]"}](${d.newRecordHolderProfileUrl})`:(d.newRecordHolderName)?d.newRecordHolderName:"[unknown]"}`, true);
	if (d.author !== "[Official Map]") {
		embed.setThumbnail(d.mapThumbnailUrl);
		embed.setURL(d.mapUrl);
	}
	// console.log("d", d);
	// console.log("\n\n--------------------------------\n\n");
	return embed;
	//await send(chan, "New record time!");
}

function embedSendManager(data, chan, maxIndex) {
	console.log(colors.grey(`* Found ${maxIndex} new WRs, sending messages...`));
	const embeds = [];
	// console.log("data (2)", data);
	// console.log("\n\n-----------------------------------------------------------\n\n");
	for (let i = data.length - maxIndex; i < data.length - 1; i++) {
		// console.log("data[i]", data[i]);
		// console.log("\n\n--------------------------------\n\n");
		embeds.push(composeEmbed(data[i]));
	}
	Promise.all(embeds.map(e => send(chan, "New record!", e))).then(msgs => {
		const lastEmbed = composeEmbed(data[data.length - 1]);
		send(chan, "New record!", lastEmbed).then(() => {
			console.log(colors.grey(`* Sent ${msgs.length+1} new WR messages.`));
		});
	}).catch(console.error);
}

function sendNewWRMessages(bot, data) {
	const chan = bot.guilds.get(serverID).channels.find(val => val.name === "wr_log");
	if (!chan.lastMessageID) {
		// console.log("data (1)", data);
		// console.log("\n\n-------------------------------\n\n");
		embedSendManager(data, chan, data.length);
	} else {
		// console.log("chan.lastMessageID", chan.lastMessageID);
		chan.fetchMessages({
			limit: 20
		}).then(msgs => msgs.filter(m => m.author.id === bot.user.id)).then(msgs => {
			const msg = msgs.first();
			if (!msg) {
				embedSendManager(data, chan, data.length);
			} else {
				//console.log("msg.embeds[0]", msg.embeds[0]);
				const mostRecentCheck = msg.embeds.filter(e => embedDataMatch(e, data[data.length - 1]));
				// console.log("mostRecentCheck", mostRecentCheck);
				if (mostRecentCheck[0]) {
					console.log(colors.grey("* No WRs need posting - Most recent WR message matches most recent data entry."));
					return;
				}
				const matchingIndices = [];
				for (let i = 0; i < data.length; i++) {
					for (const embed of msg.embeds) {
						if (embedDataMatch(embed, data[i])) {
							matchingIndices.push(i);
						}
					}
				}
				// console.log("data.length", data.length);
				// console.log("matchingIndices", matchingIndices);
				const highestMatchedIndex = Math.max(...matchingIndices);
				//console.log("data[highestMatchedIndex]", data[highestMatchedIndex]);
				embedSendManager(data, chan, data.length - highestMatchedIndex - 1);
			}
		}).catch(console.error);
	}
}

function wrLog(bot) {
	console.log(colors.grey("* Checking for new WRs..."));
	fetch("http://seekr.pw/distance-log/changelist.json").then(res => res.json()).then(json => {
		return json.map(t => parseMapData(t));
	}).catch(e => {
		if (e.code === "ECONNREFUSED" || e.code === "ECONNRESET") {
			console.log(colors.yellow(e.message));
		} else {
			console.error(e);
		}
	}).then(data => {
		if (typeof data !== "undefined") {
			sendNewWRMessages(bot, data);
		} else {
			refreshMin2 += refreshMin;
		}
		setTimeout(() => {
			wrLog(bot);
		}, refreshMin2 * 60 * 1000);
	});
}

module.exports = wrLog;
