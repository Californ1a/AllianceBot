const send = require("../util/sendMessage.js");
const fetch = require("node-fetch");

function getInfo(server = "http://35.185.40.23/") {
	return new Promise((resolve, reject) => {
		fetch(server).then((response) => {
			return response.json();
		}).then((data) => {
			resolve(data.servers);
		}).catch(err => {
			if (server !== "http://35.185.40.23/") {
				console.warn("Failed fetching from both Distance servers.", err);
				reject(err);
			} else {
				getInfo("http://distance.rip:23469/");
			}
		});
	});
}

exports.run = (bot, msg) => {
	getInfo().then(servs => {
		console.log(servs);
		let pubServs = servs.filter(s => !s.passwordProtected);
		let openPubs = pubServs.filter(s => s.connectedPlayers < s.playerLimit);
		let totalSlots = openPubs.reduce((acc, obj) => acc + (obj.playerLimit - obj.connectedPlayers), 0);
		send(msg.channel, `There ${(pubServs.length === 1) ? "is 1 public server" : `are ${pubServs.length} public servers`}${(pubServs.length > 0 && openPubs.length > 0) ? `, ${openPubs.length} of which account for a combined ${totalSlots} open slots.` : (pubServs.length > 0) ? " with no open slots.":"."}`);
	}).catch(() => send(msg.channel, "Failed to obtain server list."));
};

exports.conf = {
	guildOnly: false,
	aliases: [],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 10000
};

exports.help = {
	name: "servers",
	description: "Summary of Distance in-game public server info.",
	extendedDescription: "",
	usage: "servers"
};


//let txt = `There ${(pubServs === 1) ? "is 1 public server" : `are ${pubServs.length} public servers`}${(pubServs > 0 && openPubs.length > 0) ? `, ${openPubs.length} of which account for a combined ${totalSlots} open slots.` : "."}`;
