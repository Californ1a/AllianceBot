const send = require("../util/sendMessage.js");
const fetch = require("node-fetch");
const servers = ["http://distance.rip:23469/"];
const autoServers = ["Tag Auto Unofficial", "Campaign Auto", "PW: Nightmare", "Workshop Mix Unofficial"];

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

function compose(msg, pubServs, openPubs, totalSlots, chan, auto) {
	const u = (auto) ? "T" : "Not including auto servers, t";
	const a = (chan !== null) ? chan : "server";
	const b = (chan !== null) ? chan : "servers";
	const c = (pubServs.length === 1) ? `is 1 public ${a}` : `are ${pubServs.length} public ${b}`;
	const d = (openPubs.length < 2) ? ` with ${totalSlots} open slots.` : `, ${openPubs.length} of which account for a combined ${totalSlots} open slots.`;
	const e = (pubServs.length > 0) ? " with no open slots." : ".";
	const x = (pubServs.length > 0 && openPubs.length > 0) ? d : e;

	send(msg.channel, `${u}here ${c}${x}`);
}

exports.run = (bot, msg, args) => {
	let auto = true;
	getInfo().then(servs => {
		if (args[0] === "-f" || args[0] === "-filter") {
			// servs = servs.filter(s => !RegExp("^.*Auto$", "g").test(s.mode));
			servs = servs.filter(s => !autoServers.includes(s.serverName));
			auto = false;
		}
		//console.log(servs);
		const pubServs = servs.filter(s => !s.passwordProtected);
		const openPubs = pubServs.filter(s => s.connectedPlayers < s.playerLimit);
		const totalSlots = openPubs.reduce((acc, obj) => acc + (obj.playerLimit - obj.connectedPlayers), 0);
		const chan = (msg.guild.channels.cache.some(val => val.name === "servers")) ? msg.guild.channels.cache.find(val => val.name === "servers") : null;
		compose(msg, pubServs, openPubs, totalSlots, chan, auto);
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
