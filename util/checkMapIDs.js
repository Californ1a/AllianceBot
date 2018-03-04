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
	if (maps.has(mapName)) {
		map = maps.get(mapName);
	} else if (aliases.has(mapName)) {
		map = maps.get(aliases.get(mapName));
	} else {
		return 0;
	}
	if (map.modes.length > 1) {
		//TODO: Deal with maps that are in multiple modes
	} else {
		return map.modes[0].id;
	}
};

module.exports = checkMapID;
