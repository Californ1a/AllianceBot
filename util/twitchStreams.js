const send = require("./sendMessage.js");
const firebase = require("./firebase.js");
const TwitchClient = require("twitch").default;
const colors = require("colors");

let twitchStreams = [];
firebase.db.ref("twitch").once("value").then(data => {
	if (data.val()) {
		twitchStreams = JSON.parse(JSON.stringify(data.val().filter(v => v !== "")));
	}
});
const {
	RichEmbed
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
	for await (const stream of streams) {
		const user = await client.helix.users.getUserById(stream.userId);
		users.push(user);
	}
	return users;
}

function saveToFirebase(arr) {
	//console.log("SaveToFirebase", arr);
	firebase.db.ref("twitch").set(arr);
}

async function removeClosedStreams(streamIDs, closedStreams, chan) {
	for (let i = streamIDs.length - 1; i >= 0; i--) {
		if (closedStreams.includes(streamIDs[i])) {
			let m;
			try {
				m = await chan.fetchMessage(streamIDs[i].msgID);
			} catch (e) {
				console.log(colors.grey("* Removing from list."));
			}
			if (m) {
				//console.log("def456", m);
				await m.delete().catch(console.error);
			}
			streamIDs.splice(i, 1);
		}
	}
	return streamIDs;
}

async function sendManager(streams, users, chan, gameUrl) {
	const streamIDs = twitchStreams;
	const totalStreams = streams.length;
	let totalViewers = 0;
	let amntSent = 0;
	for await (const stream of streams) {
		totalViewers += parseInt(stream.viewers);
		const d = new Date(stream.startDate);
		const now = new Date();
		const hrs = Math.floor((((now - d) / 1000) / 60) / 60);
		const min = Math.floor(((now - d - (hrs * 60 * 60 * 1000)) / 1000) / 60);
		const uptime = `${(hrs.toString().length===1)?`0${hrs}`:hrs}:${(min.toString().length===1)?`0${min}`:min}`;
		const embed = new RichEmbed()
			.setDescription(stream.title)
			.setColor([100, 60, 160])
			.setAuthor(stream.userDisplayName, users.filter(u => u.id === stream.userId)[0].profilePictureUrl, `https://twitch.tv/${stream.userDisplayName}`)
			.setTimestamp(d)
			.setFooter("Started at", "https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png")
			.setURL(`https://twitch.tv/${stream.userDisplayName}`)
			.addField("Viewers", stream.viewers, true)
			.addField("Uptime", uptime, true)
			.addField("URL", `[ttv/${stream.userDisplayName}](https://twitch.tv/${stream.userDisplayName})`, true);
		const img = `${stream.thumbnailUrl.replace("{width}", "880").replace("{height}", "496")}?${Date.now()}`;
		if (streams.length > 2) {
			embed.setThumbnail(img);
		} else {
			embed.setImage(img);
		}
		if (streamIDs.filter(s => s.streamID === stream.id).length === 0) {
			const m = await send(chan, "", embed);
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
				msg = await chan.fetchMessage(msgID);
			} catch (e) {
				console.log(colors.grey("* Message was deleted before stream ended. Reposting..."));
			}
			if (msg) {
				await msg.edit("", embed).catch(console.error);
			} else {
				const closedStreams = streamIDs.filter(sid => sid.msgID === msgID);
				const newStreamIDs = await removeClosedStreams(streamIDs, closedStreams, chan);
				//console.log("newStreamIDsA", newStreamIDs);
				saveToFirebase(newStreamIDs);
				const m = await send(chan, "", embed);
				streamIDs.push({
					streamID: stream.id,
					msgID: m.id
				});
				amntSent++;
			}
		} else {
			console.error(colors.red("wtf multiple with same id"));
		}
	}
	chan.setTopic(`${gameUrl} \n- Streams: ${totalStreams} \n- Viewers: ${totalViewers}`);
	if (amntSent > 0) {
		console.log(colors.grey(`* Sent ${amntSent} new twitch streams.`));
		amntSent = 0;
	}
	const closedStreams = streamIDs.filter(sid => streams.filter(s => s.id === sid.streamID).length === 0);
	if (closedStreams.length > 0) {
		console.log(colors.grey(`* Found ${closedStreams.length} closed twitch streams.`));
	}
	const newStreamIDs = await removeClosedStreams(streamIDs, closedStreams, chan);
	//console.log("newStreamIDsB", newStreamIDs);
	saveToFirebase(newStreamIDs);
}

function main(bot, chan, guild, gameName, conf) {
	const gameUrl = `https://twitch.tv/directory/game/${encodeURIComponent(gameName)}`;
	getGameID(gameName)
		.then(getStreamsForGame)
		.then(data => {
			//console.log(data.streams);
			getAllUsers(data.streams).then(users => {
				//console.log(users);
				sendManager(data.streams, users, chan, gameUrl).then(() => {
					conf.streamTimeout = setTimeout(() => {
						streams(bot, guild);
					}, 60 * 1000);
				});
			});
		});
}

function streams(bot, guild) {
	const conf = bot.servConf.get(guild.id);
	const twitchChannel = conf.twitchchannel;
	const gameName = conf.twitchgame;
	if (twitchChannel) {
		const twitchchanid = twitchChannel.slice(2, twitchChannel.length - 1);
		const chan = guild.channels.get(twitchchanid);
		if (chan && gameName) {
			main(bot, chan, guild, gameName, conf);
		}
	}
	//const chan = bot.guilds.get(serverID).channels.get(chanID);
}

module.exports = streams;
