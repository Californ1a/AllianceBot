const {
	Permissions
} = require("discord.js");
const send = require("./sendMessage.js");
const firebase = require("./firebase.js");
const {
	ClientCredentialsAuthProvider
} = require("@twurple/auth");
const {
	ApiClient
} = require("@twurple/api");
const colors = require("colors");
const refreshMin = 1;
const timeBeforeMsg = 10;

let twitchStreams = [];
firebase.db.ref("twitch").once("value").then(data => {
	if (data.val()) {
		twitchStreams = JSON.parse(JSON.stringify(data.val())); //.filter(v => v !== "")
	}
});
const {
	MessageEmbed
} = require("discord.js");

const clientID = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
//const client = TwitchClient.withClientCredentials(clientID, clientSecret);
const authProvider = new ClientCredentialsAuthProvider(clientID, clientSecret);
const client = new ApiClient({
	authProvider
});

async function getGameID(name) {
	const game = await client.games.getGameByName(name);
	return game.id;
}

async function getStreamsForGame(gameid, opts = {
	game: gameid,
	limit: 100
}, result = {
	streams: []
}) {
	const streams = await client.streams.getStreams(opts);
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
	let users = streams.map(stream => client.users.getUserById(stream.userId));
	users = await Promise.all(users);
	return users;
}

function saveToFirebase(arr, guildID) {
	firebase.db.ref(`twitch/${guildID}`).set(arr);
	twitchStreams[guildID] = arr;
}

async function removeClosedStreams(streamIDs, closedStreams, chan) {
	for (let i = streamIDs.length - 1; i >= 0; i--) {
		if (closedStreams.includes(streamIDs[i])) {
			let m;
			try {
				m = await chan.messages.fetch(streamIDs[i].msgID);
			} catch (e) {
				console.log(colors.green("* Couldn't fetch message - Removing from list."));
				//console.error(e);
			}
			if (m) {
				try {
					await m.delete();
				} catch (e) {
					console.log(colors.red(`Could not delete msg with id ${m.id} from author ${m.author.username} with id ${m.author.id}`));
					console.error(e);
				}
			}
			streamIDs.splice(i, 1);
		}
	}
	return streamIDs;
}

async function sendManager(streams, users, chan, gameUrl, conf) {
	let streamIDs = (twitchStreams[chan.guild.id]) ? twitchStreams[chan.guild.id] : [];
	const totalStreams = streams.length;
	let amntSent = 0;
	for (const stream of streams) {
		const user = users.filter(u => u.id === stream.userId)[0];
		const d = new Date(stream.startDate);
		const now = new Date();
		const hrs = Math.floor((((now - d) / 1000) / 60) / 60);
		const min = Math.floor(((now - d - (hrs * 60 * 60 * 1000)) / 1000) / 60);
		const uptime = `${(hrs.toString().length===1)?`0${hrs}`:hrs}:${(min.toString().length===1)?`0${min}`:min}`;
		const embed = new MessageEmbed()
			.setDescription(stream.title)
			.setColor([100, 60, 160])
			.setAuthor({
				name: stream.userDisplayName,
				iconURL: user.profilePictureUrl,
				url: `https://twitch.tv/${user.name}`
			})
			.setTimestamp(d)
			.setFooter({
				text: "Started at",
				iconURL: "https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png"
			})
			.setURL(`https://twitch.tv/${user.name}`)
			.addField("Viewers", stream.viewers.toString(), true)
			.addField("Uptime", uptime, true)
			.addField("URL", `[ttv/${user.name}](https://twitch.tv/${user.name})`, true);
		const img = `${stream.thumbnailUrl.replace("{width}", "880").replace("{height}", "496")}?${Date.now()}`;
		if (streams.length > 1) {
			embed.setThumbnail(img);
		} else {
			embed.setImage(img);
		}
		if (streamIDs.filter(s => s.streamID === stream.id).length === 0) {
			const m = await send(chan, {
				content: "\u200b",
				embeds: [embed]
			});
			streamIDs.push({
				streamID: stream.id,
				msgID: m.id
			});
			amntSent++;
		} else if (streamIDs.filter(s => s.streamID === stream.id).length === 1) {
			const msgID = streamIDs.filter(s => s.streamID === stream.id)[0].msgID;
			let msg;
			try {
				msg = await chan.messages.fetch(msgID);
			} catch (e) {
				console.log(colors.green("* Message was deleted before stream ended. Reposting..."));
			}
			if (msg) {
				try {
					await msg.edit({
						content: "\u200b",
						embeds: [embed]
					});
				} catch (e) {
					console.log(colors.red(`Couldn't edit msg ${msg.id} from author ${msg.author.username} with id ${msg.author.id}`));
					console.error(e);
				}
			} else {
				const closedStreams = streamIDs.filter(sid => sid.msgID === msgID);
				const newStreamIDs = await removeClosedStreams(streamIDs, closedStreams, chan);
				saveToFirebase(newStreamIDs, chan.guild.id);
				let m;
				try {
					m = await send(chan, {
						content: "\u200b",
						embeds: [embed]
					});
				} catch (e) {
					console.log(colors.red(`B - Couldn't send msg to channel ${chan.name} with id ${chan.id} on guild ${chan.guild.name} with id ${chan.guild.id}`));
					console.error(e);
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
				msg = await chan.messages.fetch(msgID);
			} catch (e) {
				console.log(colors.green("* Message couldn't be found."));
			}

			console.log(colors.green("* Deleting duplicate..."));
			if (msg) {
				msg.delete();
			}
			streamIDs = streamIDs.filter(sid => sid.msgID !== msgID);
			saveToFirebase(streamIDs, chan.guild.id);
			console.log(colors.green("* Deleted duplicate."));
			console.log(streamIDs);
		}
	}

	const closedStreams = streamIDs.filter(sid => streams.filter(s => s.id === sid.streamID).length === 0);

	const newStreamIDs = await removeClosedStreams(streamIDs, closedStreams, chan);
	saveToFirebase(newStreamIDs, chan.guild.id);

	if (amntSent > 0 && closedStreams.length === 0) {
		console.log(colors.green(`* Sent ${amntSent} new twitch streams in guild ${chan.guild.name}.`));
		chan.setTopic(`${gameUrl} \n- Streams: ${totalStreams}`);
		amntSent = 0;
	} else if (amntSent > 0 && closedStreams.length > 0) {
		console.log(colors.green(`* Sent ${amntSent} new twitch streams and removed ${closedStreams.length} closed twitch streams from guild ${chan.guild.name}.`));
		chan.setTopic(`${gameUrl} \n- Streams: ${totalStreams}`);
	} else if (amntSent === 0 && closedStreams.length > 0) {
		console.log(colors.green(`* Removed ${closedStreams.length} closed twitch streams from guild ${chan.guild.name}.`));
		chan.setTopic(`${gameUrl} \n- Streams: ${totalStreams}`);
	} else {
		// console.log(colors.green("* No twitch stream changes."));
	}

	if (conf.checkAmnt >= timeBeforeMsg) {
		console.log(colors.green(`* Checked twitch streams ${timeBeforeMsg} times in the past ${refreshMin * timeBeforeMsg} minutes for guild ${chan.guild.name}.`));
		conf.checkAmnt = 0;
		// conf.currentTimestamp = Date.now();
	}
	conf.checkAmnt += 1;
}

function errHandler(err, conf, bot, guild) {
	conf.streamTimeout = setTimeout(() => {
		conf.twitchStreamError = false;
		streams(bot, guild);
	}, refreshMin * 60 * 1000);
}

function main(bot, chan, guild, gameName, conf) {
	const gameUrl = `https://twitch.tv/directory/game/${encodeURIComponent(gameName)}`;
	let errCheck = false;
	getGameID(gameName)
		.then(getStreamsForGame)
		.then(data => {
			getAllUsers(data.streams).then(users => {
				sendManager(data.streams, users, chan, gameUrl, conf).then(() => {
					conf.streamTimeout = setTimeout(() => {
						streams(bot, guild);
					}, refreshMin * 60 * 1000);
				});
			}).catch(err => {
				console.error(`Failed to check twitch streams: ${err}`);
				if (!errCheck) {
					errCheck = true;
					errHandler(err, conf, bot, guild);
				}
			});
		})
		.catch(err => {
			console.error(`Failed to check twitch streams: ${err}`);
			if (!errCheck) {
				errCheck = true;
				errHandler(err, conf, bot, guild);
			}
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
		const missingPerms = chan.guild.members.cache.get(bot.user.id).permissions.missing([Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.MANAGE_CHANNELS]);
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
