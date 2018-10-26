const fetch = require("node-fetch");
const colors = require("colors");
const send = require("./sendMessage.js");
const serverID = "83078957620002816";
const channelName = "servers";
const refreshMin = 1;
const logTimeMin = 10;
let refreshMin2 = refreshMin;
let d = Date.now();
let count = 0;
const serversEmbed = {
	"description": `This list is updated once per ${(refreshMin===1)?"minute":`${refreshMin} minutes`} and displays up to the first 25 servers listed. You may also use \`!servers\` in any other channel to get a short summary of the current public server info without having to look at this channel.`,
	"color": 4886754,
	"footer": {
		"icon_url": "https://cdn.discordapp.com/emojis/230880420130979841.png",
		"text": "Last Updated (ET)"
	},
	"author": {
		"name": "Distance Servers",
		"url": "http://distance.rip/",
		"icon_url": "https://cdn.discordapp.com/emojis/230369859920330752.png"
	},
	"fields": []
};
const emptyFields = [{
	"name": "\u200B",
	"value": "\u200B",
	"inline": true
}, {
	"name": "\u200B \u200B \u200B No Servers",
	"value": "Start your own!",
	"inline": true
}, {
	"name": "\u200B",
	"value": "\u200B",
	"inline": true
}];

const updateEmbed = (bot, servers) => {
	const distance = bot.guilds.get(serverID);
	if (!distance.channels.some(val => val.name === channelName)) {
		return;
	}
	const channel = distance.channels.find(val => val.name === channelName);
	let fieldsArray = [];
	if (servers[0]) {
		for (const serv of servers) {
			const servName = serv.serverName.replace(/^\[[a-zA-Z0-9]{6}\]/i, "");
			fieldsArray.push({
				"name": (serv.passwordProtected) ? `~~${servName}~~` : servName,
				"value": `${serv.mode} (${serv.connectedPlayers}/${serv.playerLimit}) \`${serv.build}\``,
				"inline": true
			});
		}
		fieldsArray = fieldsArray.slice(0, 25);
		serversEmbed.fields = fieldsArray;
	} else {
		serversEmbed.fields = emptyFields;
	}
	serversEmbed.timestamp = new Date();
	channel.fetchMessages({
		limit: 20
	}).then(messages => {
		if (messages.size === 0) {
			send(channel, "Distance Server List", {
				embed: serversEmbed
			}).catch(console.error);
			refreshMin2 = refreshMin;
		} else {
			const bm = messages.filter(m => m.author.id === bot.user.id);
			const mm = messages.filter(m => m.author.id !== bot.user.id);
			if (mm.size > 1) {
				mm.deleteAll().catch(console.error);
			}
			if (bm.size > 0) {
				bm.first().edit("Distance Server List", {
					embed: serversEmbed
				}).then(() => {
					count++;
					if (Date.now() - d >= logTimeMin * 60 * 1000) {
						console.log(colors.grey(`* Updated Distance server list ${count} times in the past ${logTimeMin} minutes.`));
						d = Date.now();
						count = 0;
					}
					refreshMin2 = refreshMin;
				}).catch(console.error);
			} else {
				send(channel, "Distance Server List", {
					embed: serversEmbed
				}).catch(console.error);
				refreshMin2 = refreshMin;
			}
		}
	}).catch(console.error);
};

const distanceServers = (bot, servers = ["http://distance.rip:23469/"]) => {
	Promise.all(servers.map(fetch))
		.then(responses => Promise.all(responses.map(res => res.json())))
		.then(multiData => multiData.reduce((merge, data) => ({
			...merge,
			...data
		})))
		.catch(e => {
			if (e.code === "ECONNREFUSED" || e.code === "ECONNRESET") {
				console.log(colors.yellow(e.message));
			} else {
				console.error(e);
			}
		})
		.then(merged => {
			if (typeof merged !== "undefined") {
				updateEmbed(bot, merged.servers);
			} else {
				refreshMin2 += refreshMin;
			}
			setTimeout(() => {
				distanceServers(bot);
			}, refreshMin2 * 60 * 1000);
		});
};

module.exports = distanceServers;
