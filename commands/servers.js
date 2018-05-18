const send = require("../util/sendMessage.js");
const fetch = require("node-fetch");
const servers = ["http://35.185.40.23/", "http://distance.rip:23469/"];

function getInfo() {
	return new Promise((resolve, reject) => {
		Promise.all(servers.map(fetch))
			.then(responses => Promise.all(responses.map(res => res.json())))
			.then(multiData => multiData.reduce((merge, data) => ({
				...merge,
				...data
			})))
			.then(merged => {
				if (typeof merged !== "undefined") {
					resolve(merged.servers);
				} else {
					reject(new Error("Server list undefined"));
				}
			}).catch(e => reject(e));
	});
}

exports.run = (bot, msg) => {
	getInfo().then(servs => {
		console.log(servs);
		const pubServs = servs.filter(s => !s.passwordProtected);
		const openPubs = pubServs.filter(s => s.connectedPlayers < s.playerLimit);
		const totalSlots = openPubs.reduce((acc, obj) => acc + (obj.playerLimit - obj.connectedPlayers), 0);
		const chan = (msg.guild.channels.exists("name", "servers")) ? msg.guild.channels.find("name", "servers") : null;
		send(msg.channel, `There ${(pubServs.length === 1) ? `is 1 public ${(chan!==null)?chan:"server"}` : `are ${pubServs.length} public ${(chan!==null)?chan:"servers"}`}${(pubServs.length > 0 && openPubs.length > 0) ? (openPubs.length < 2) ? ` with ${totalSlots} open slots.` : `, ${openPubs.length} of which account for a combined ${totalSlots} open slots.` : (pubServs.length > 0) ? " with no open slots.":"."}`);
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
