const send = require("./sendMessage.js");
const firebase = require("./firebase.js");
const TwitchClient = require("twitch").default;
const colors = require("colors");
const refreshMin = 1;
const timeBeforeMsg = 10;

let twitchStreams = [];
firebase.db.ref("twitch").once("value").then(data => {
	if (data.val()) {
		twitchStreams = JSON.parse(JSON.stringify(data.val())); //.filter(v => v !== "")
		// console.log("twitchStreams1", twitchStreams);
	}
});
const {
	MessageEmbed
} = require("discord.js");

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const client = TwitchClient.withClientCredentials(clientId, clientSecret);

async function getGameID(name) {
	const game = await client.helix.games.getGameByName(name);
	return game.id;
}

async function getStreamsForGame(gameid, opts = {
	game: gameid,
	limit: 100
}, result = {
	streams: []
}) {
	const streams = await client.helix.streams.getStreams(opts);
	result = {
		game: gameid,
		streams: streams.data
	};
	if (streams.data.length === 100) {
		const res = await getStreamsForGame(gameid, {
			after: streams.cursor,
			game: gameid,
			limit: 100
		}, result);
		return {
			game: gameid,
			streams: [...result.streams, ...res.streams]
		};
	} else {
		return result;
	}
}

async function getAllUsers(streams) {
	const users = [];
	for (const stream of streams) {
		const user = await client.helix.users.getUserById(stream.userId);
		users.push(user);
	}
	return users;
}

function saveToFirebase(arr, guildID) {
	//console.log("SaveToFirebase", arr);
	firebase.db.ref(`twitch/${guildID}`).set(arr);
	twitchStreams[guildID] = arr;
}

async function removeClosedStreams(streamIDs, closedStreams, chan) {
	for (let i = streamIDs.length - 1; i >= 0; i--) {
		if (closedStreams.includes(streamIDs[i])) {
			let m;
			try {
				// console.log("B");
				// console.log("HIT DISCORD 1");
				m = await chan.messages.fetch(streamIDs[i].msgID); // HIT DISCORD
			} catch (e) {
				console.log(colors.green("* Removing from list."));
			}
			if (m) {
				//console.log("def456", m);
				try {
					// console.log("HIT DISCORD 2");
					await m.delete(); // HIT DISCORD
				} catch (e) {
					console.log(colors.red(`Could not delete msg with id ${m.id} from author ${m.author.username} with id ${m.author.id}`));
				}
			}
			streamIDs.splice(i, 1);
		}
	}
	return streamIDs;
}

async function sendManager(streams, users, chan, gameUrl, conf) {
	let streamIDs = (twitchStreams[chan.guild.id]) ? twitchStreams[chan.guild.id] : [];
	// console.log("twitchStreams2", twitchStreams);
	// console.log("streamIDs", streamIDs);
	const totalStreams = streams.length;
	let amntSent = 0;
	for (const stream of streams) {
		// totalViewers += parseInt(stream.viewers);
		const user = users.filter(u => u.id === stream.userId)[0];
		const d = new Date(stream.startDate);
		const now = new Date();
		const hrs = Math.floor((((now - d) / 1000) / 60) / 60);
		const min = Math.floor(((now - d - (hrs * 60 * 60 * 1000)) / 1000) / 60);
		const uptime = `${(hrs.toString().length===1)?`0${hrs}`:hrs}:${(min.toString().length===1)?`0${min}`:min}`;
		const embed = new MessageEmbed()
			.setDescription(stream.title)
			.setColor([100, 60, 160])
			.setAuthor(stream.userDisplayName, user.profilePictureUrl, `https://twitch.tv/${user.name}`)
			.setTimestamp(d)
			.setFooter("Started at", "https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png")
			.setURL(`https://twitch.tv/${user.name}`)
			.addField("Viewers", stream.viewers, true)
			.addField("Uptime", uptime, true)
			.addField("URL", `[ttv/${user.name}](https://twitch.tv/${user.name})`, true);
		const img = `${stream.thumbnailUrl.replace("{width}", "880").replace("{height}", "496")}?${Date.now()}`;
		if (streams.length > 1) {
			embed.setThumbnail(img);
		} else {
			embed.setImage(img);
		}
		if (streamIDs.filter(s => s.streamID === stream.id).length === 0) {
			// console.log("HIT DISCORD 3");
			const m = await send(chan, "", embed); // HIT DISCORD
			streamIDs.push({
				streamID: stream.id,
				msgID: m.id
			});
			amntSent++;
		} else if (streamIDs.filter(s => s.streamID === stream.id).length === 1) {
			const msgID = streamIDs.filter(s => s.streamID === stream.id)[0].msgID;
			// console.log("msgID", msgID);
			let msg;
			try {
				// console.log("A");
				// console.log("HIT DISCORD 4");
				msg = await chan.messages.fetch(msgID); // HIT DISCORD
			} catch (e) {
				console.log(colors.green("* Message was deleted before stream ended. Reposting..."));
			}
			if (msg) {
				try {
					// console.log("HIT DISCORD 5");
					await msg.edit("", embed); // HIT DISCORD
				} catch (e) {
					console.log(colors.red(`Couldn't edit msg ${msg.id} from author ${msg.author.username} with id ${msg.author.id}`));
				}
			} else {
				const closedStreams = streamIDs.filter(sid => sid.msgID === msgID);
				const newStreamIDs = await removeClosedStreams(streamIDs, closedStreams, chan);
				//console.log("newStreamIDsA", newStreamIDs);
				saveToFirebase(newStreamIDs, chan.guild.id);
				let m;
				try {
					// console.log("HIT DISCORD 6");
					m = await send(chan, "", embed); // HIT DISCORD
				} catch (e) {
					console.log(colors.red(`B - Couldn't send msg to channel ${chan.name} with id ${chan.id} on guild ${chan.guild.name} with id ${chan.guild.id}`));
				}
				streamIDs.push({
					streamID: stream.id,
					msgID: m.id
				});
				amntSent++;
			}
		} else {
			console.error(colors.red("wtf multiple with same id"));
			console.log(streamIDs);

			const msgID = streamIDs.filter(s => s.streamID === stream.id)[0].msgID;

			let msg;
			try {
				// console.log("HIT DISCORD 7");
				msg = await chan.messages.fetch(msgID); // HIT DISCORD
			} catch (e) {
				console.log(colors.green("* Message couldn't be found."));
			}

			console.log(colors.green("* Deleting duplicate..."));
			if (msg) {
				// console.log("HIT DISCORD 8");
				msg.delete(); // HIT DISCORD
			}
			streamIDs = streamIDs.filter(sid => sid.msgID !== msgID);
			saveToFirebase(streamIDs, chan.guild.id);
			console.log(colors.green("* Deleted duplicate."));
			console.log(streamIDs);
		}
	}

	const closedStreams = streamIDs.filter(sid => streams.filter(s => s.id === sid.streamID).length === 0);

	const newStreamIDs = await removeClosedStreams(streamIDs, closedStreams, chan);
	//console.log("newStreamIDsB", newStreamIDs);
	saveToFirebase(newStreamIDs, chan.guild.id);

	// console.log("amntSent", amntSent);
	// console.log("closedStreams.length", closedStreams.length);
	if (amntSent > 0 && closedStreams.length === 0) {
		console.log(colors.green(`* Sent ${amntSent} new twitch streams in guild ${chan.guild.name}.`));
		// console.log("HIT DISCORD 9");
		chan.setTopic(`${gameUrl} \n- Streams: ${totalStreams}`); // HIT DISCORD
		amntSent = 0;
	} else if (amntSent > 0 && closedStreams.length > 0) {
		console.log(colors.green(`* Sent ${amntSent} new twitch streams and removed ${closedStreams.length} closed twitch streams from guild ${chan.guild.name}.`));
		// console.log("HIT DISCORD 10");
		chan.setTopic(`${gameUrl} \n- Streams: ${totalStreams}`); // HIT DISCORD
	} else if (amntSent === 0 && closedStreams.length > 0) {
		console.log(colors.green(`* Removed ${closedStreams.length} closed twitch streams from guild ${chan.guild.name}.`));
		// console.log("HIT DISCORD 11");
		chan.setTopic(`${gameUrl} \n- Streams: ${totalStreams}`); // HIT DISCORD
	} else {
		// console.log(colors.green("* No twitch stream changes."));
	}

	if (conf.checkAmnt >= timeBeforeMsg) {
		// if (conf.currentTimestamp) {
		// 	console.log(`Time elapsed: ${((Date.now()-conf.currentTimestamp)/1000)/60} min`);
		// }
		console.log(colors.green(`* Checked twitch streams ${timeBeforeMsg} times in the past ${refreshMin * timeBeforeMsg} minutes for guild ${chan.guild.name}.`));
		conf.checkAmnt = 0;
		// conf.currentTimestamp = Date.now();
	}
	conf.checkAmnt += 1;
}

function main(bot, chan, guild, gameName, conf) {
	const gameUrl = `https://twitch.tv/directory/game/${encodeURIComponent(gameName)}`;
	getGameID(gameName)
		.then(getStreamsForGame)
		.then(data => {
			//console.log(data.streams);
			getAllUsers(data.streams).then(users => {
				//console.log(users);
				sendManager(data.streams, users, chan, gameUrl, conf).then(() => {
					conf.streamTimeout = setTimeout(() => {
						streams(bot, guild);
					}, refreshMin * 60 * 1000);
				});
			});
		});
}

function streams(bot, guild) {
	const conf = bot.servConf.get(guild.id);
	conf.checkAmnt = (conf.checkAmnt || conf.checkAmnt === 0) ? conf.checkAmnt : 0;
	const twitchChannel = conf.twitchchannel;
	const gameName = conf.twitchgame;
	if (twitchChannel) {
		const twitchchanid = twitchChannel.slice(2, twitchChannel.length - 1);
		const chan = guild.channels.cache.get(twitchchanid);
		// console.log("HIT DISCORD 12");
		const missingPerms = chan.guild.members.cache.get(bot.user.id).permissions.missing(["VIEW_CHANNEL", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS"]); // HIT DISCORD
		// console.log(missingPerms);
		if (chan && gameName && missingPerms.length === 0) {
			main(bot, chan, guild, gameName, conf);
		} else {
			// console.log(colors.green(`* No twitch game set for guild ${guild.id} or couldn't find channel with id ${twitchchanid}.`));
		}
	} else {
		// console.log(colors.green(`* No twitch channel set for guild ${guild.id}.`));
	}
	//const chan = bot.guilds.cache.get(serverID).channels.cache.get(chanID);
}

module.exports = streams;
