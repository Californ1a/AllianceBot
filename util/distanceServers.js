const fetch = require("node-fetch");
const colors = require("colors");
const send = require("./sendMessage.js");
const serverID = "83078957620002816";
const channelName = "servers";
let refreshMin = 5;
let serversEmbed = {
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

let updateEmbed = (bot, servers) => {
	let distance = bot.guilds.get(serverID);
	if (!distance.channels.exists("name", channelName)) {
		return;
	}
	let channel = distance.channels.find("name", "servers");
	let fieldsArray = [];
	if (servers[0]) {
		for (let serv of servers) {
			fieldsArray.push({
				"name": (serv.passwordProtected) ? `~~${serv.serverName}~~` : serv.serverName,
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
			send(channel, "a", {
				embed: serversEmbed
			});
		} else {
			let bm = messages.filter(m => m.author.id === bot.user.id);
			let mm = messages.filter(m => m.author.id !== bot.user.id);
			if (mm.size > 1) {
				messages.forEach(m => {
					m.deleteAll().catch(console.error);
				});
			}
			if (bm.size > 0) {
				bm.first().edit("b", {
					embed: serversEmbed
				}).then(() => {
					console.log(colors.grey("Updated Distance server list"));
				});
			} else {
				send(channel, "c", {
					embed: serversEmbed
				});
			}
		}
	}).catch(console.error);

};

let distanceServers = (bot, server = "http://35.185.40.23/") => {
	fetch(server).then((response) => {
		return response.json();
	}).then((data) => {
		updateEmbed(bot, data.servers);
	}).catch(err => {
		if (server !== "http://35.185.40.23/") {
			console.warn("Failed fetching from both Distance servers.", err);
		} else {
			distanceServers(bot, "http://distance.rip:23469/");
		}
	});
	setTimeout(() => {
		distanceServers(bot);
	}, refreshMin * 60 * 1000);
};

module.exports = distanceServers;
