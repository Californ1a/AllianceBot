const fetch = require("node-fetch");
const colors = require("colors");
const send = require("./sendMessage.js");
const serverID = "83078957620002816";
const channelName = "servers";
const refreshMin = 5;
let refreshMin2 = refreshMin;
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
	if (!distance.channels.exists("name", channelName)) {
		return;
	}
	const channel = distance.channels.find("name", "servers");
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
				messages.forEach(m => {
					m.deleteAll().catch(console.error);
				});
			}
			if (bm.size > 0) {
				bm.first().edit("Distance Server List", {
					embed: serversEmbed
				}).then(() => {
					console.log(colors.grey("* Updated Distance server list"));
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

const distanceServers = (bot, servers = ["http://35.185.40.23/", "http://distance.rip:23469/"]) => {
	Promise.all(servers.map(fetch))
		.then(responses => Promise.all(responses.map(res => res.json())))
		.then(multiData => multiData.reduce((merge, data) => ({
			...merge,
			...data
		})))
		.catch(console.error)
		.then(merged => {
			if (typeof merged !== "undefined") {
				updateEmbed(bot, merged.servers);
			} else {
				refreshMin2 *= 2;
			}
			setTimeout(() => {
				distanceServers(bot);
			}, refreshMin2 * 60 * 1000);
		});
};

module.exports = distanceServers;
