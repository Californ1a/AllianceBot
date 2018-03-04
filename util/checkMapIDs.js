const Discord = require("discord.js");
const mapjson = require("../mapids.json");
let maps = new Discord.Collection();
let aliases = new Discord.Collection();
for (let elt in mapjson) {
	maps.set(elt, mapjson[elt]);
	if (mapjson[elt].aliases[0]) {
		for (let ele of mapjson[elt].aliases) {
			aliases.set(ele, elt);
		}
	}
}

let checkMapID = (args) => {
	let mapName = args.join(" ").toLowerCase();
	let map;
	let name;
	if (maps.has(mapName)) {
		name = mapName;
		map = maps.get(mapName);
	} else if (aliases.has(mapName)) {
		name = aliases.get(mapName);
		map = maps.get(name);
	} else {
		return 0;
	}
	let modeIndex = 0;
	let mode = map.modes[modeIndex].mode;
	if (map.modes.length > 1) {
		//TODO: Deal with maps that are in multiple modes, hardcoded for now
		modeIndex = 0;
	} else {
		return {
			name,
			mode,
			id: map.modes[modeIndex].id
		};
	}
};

module.exports = checkMapID;
