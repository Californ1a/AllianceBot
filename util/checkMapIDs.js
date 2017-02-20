const jsondata = require("../mapids.json");
var i = 0;

var getMapID = function(args, mapname) {
	i = 0;
	var id = 0;
	if (!(args[args.length-1].match(/^s$/i) || args[args.length-1].match(/^sprint$/i) || args[args.length-1].match(/^sas$/i) || args[args.length-1].match(/^speed$/i) || args[args.length-1].match(/^sns$/i) || args[args.length-1].match(/^s&s$/i))) {
		id = jsondata.officialmapids["Sprint"][mapname];
	} else {
		if (typeof args[i] === "string" && (args[i].match(/^sas$/i) || args[i].match(/^speed$/i) || args[i].match(/^sns$/i) || args[i].match(/^s&s$/i))) {
			id = jsondata.officialmapids["Speed and Style"][mapname];
		} else if (typeof args[i] === "string" && (args[i].match(/^s$/i) || args[i].match(/^sprint$/i))) {
			id = jsondata.officialmapids["Sprint"][mapname];
		}
	}
	return id;
};

var checkBS = function(args) {
	var mapname = "Broken Symmetry";
	var id = 0;
	if (args[0].match(/^broken$/i)) {
		if (typeof args[1] === "string" && args[1].match(/^symmetry$/i)) {
			id = getMapID(args, mapname);
		}
	} else if (args[0].match(/^bs$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkLS = function(args) {
	var mapname = "Lost Society";
	var id = 0;
	if (args[0].match(/^lost$/i)) {
		if (typeof args[1] === "string" && args[1].match(/^society$/i)) {
			id = getMapID(args, mapname);
		}
	} else if (args[0].match(/^ls$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkNS = function(args) {
	var mapname = "Negative Space";
	var id = 0;
	if (args[0].match(/^negative$/i)) {
		if (typeof args[1] === "string" && (args[1].match(/^space$/i))) {
			id = getMapID(args, mapname);
		}
	} else if (args[0].match(/^ns$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkDep = function(args) {
	var mapname = "Departure";
	var id = 0;
	if (args[0].match(/^departure$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkFric = function(args) {
	var mapname = "Friction";
	var id = 0;
	if (args[0].match(/^friction$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkAft = function(args) {
	var mapname = "Aftermath";
	var id = 0;
	if (args[0].match(/^aftermath$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkMachines = function(args) {
	var mapname = "The Thing About Machines";
	var id = 0;
	if (args[0].match(/^the$/i)) {
		if (typeof args[1] === "string" && args[1].match(/^thing$/i)) {
			if (typeof args[2] === "string" && args[2].match(/^about$/i)) {
				if (typeof args[3] === "string" && args[3].match(/^machines$/i)) {
					id = getMapID(args, mapname);
				}
			}
		}
	} else if (args[0].match(/^thing$/i)) {
		if (typeof args[1] === "string" && args[1].match(/^about$/i)) {
			if (typeof args[2] === "string" && args[2].match(/^machines$/i)) {
				id = getMapID(args, mapname);
			}
		}
	} else if (args[0].match(/^machines$/i)) {
		id = getMapID(args, mapname);
	} else if (args[0].match(/^ttam$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkAmus = function(args) {
	var mapname = "Amusement";
	var id = 0;
	if (args[0].match(/^amusement$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkCorrup = function(args) {
	var mapname = "Corruption";
	var id = 0;
	if (args[0].match(/^corruption$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkObs = function(args) {
	var mapname = "The Observer Effect";
	var id = 0;
	if (args[0].match(/^the$/i)) {
		if (typeof args[1] === "string" && args[1].match(/^observer$/i)) { //partial observer
			if (typeof args[2] === "string" && args[2].match(/^effect$/i)) {
				id = getMapID(args, mapname);
			}
		}
	} else if (args[0].match(/^observer$/i)) {
		id = getMapID(args, "The Observer Effect");
	} else if (args[0].match(/^toe$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkDiss = function(args) {
	var mapname = "Dissolution";
	var id = 0;
	if (args[0].match(/^dissolution$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkFall = function(args) {
	var mapname = "Falling Through";
	var id = 0;
	if (args[0].match(/^falling$/i)) {
		id = getMapID(args, mapname);
	} else if (args[0].match(/^ft$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkMon = function(args) {
	var mapname = "Monolith";
	var id = 0;
	if (args[0].match(/^monolith$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkUncanny = function(args) {
	var mapname = "Uncanny Valley";
	var id = 0;
	if (args[0].match(/^uncanny$/i)) {
		id = getMapID(args, mapname);
	}
	return id;
};

var checkDodge = function(args) {
	var mapname = "Dodge";
	var id = 0;
	if (args[0].match(/^dodge$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkThunder = function(args) {
	var mapname = "Thunder Struck";
	var id = 0;
	if (args[0].match(/^thunder$/i)) {
		if (typeof args[1] === "string" && args[1].match(/^struck$/i)) {
			id = jsondata.officialmapids["Challenge"][mapname];
		}
	} else if (args[0].match(/^thunderstruck$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	} else if (args[0].match(/^ts$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkGrind = function(args) {
	var mapname = "Grinder";
	var id = 0;
	if (args[0].match(/^grinder$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkDesc = function(args) {
	var mapname = "Descent";
	var id = 0;
	if (args[0].match(/^descent$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkDeta = function(args) {
	var mapname = "Detached";
	var id = 0;
	if (args[0].match(/^detached$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkElev = function(args) {
	var mapname = "Elevation";
	var id = 0;
	if (args[0].match(/^elevation$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkCredits = function(args) {
	var mapname = "Credits";
	var id = 0;
	if (args[0].match(/^credits$/i)) {
		id = jsondata.officialmapids["Stunt"][mapname];
	}
	return id;
};

var checkRefrac = function(args) {
	var mapname = "Refraction";
	var id = 0;
	if (args[0].match(/^refraction$/i)) {
		id = jsondata.officialmapids["Stunt"][mapname];
	}
	return id;
};

var checkSpace = function(args) {
	var mapname = "Space Skate";
	var id = 0;
	if (args[0].match(/^space$/i) && args[2].match(/^skate$/i)) {
		id = jsondata.officialmapids["Stunt"][mapname];
	}
	return id;
};

var checkSpooky = function(args) {
	var mapname = "Spooky Town";
	var id = 0;
	if (args[0].match(/^spooky$/i) && args[2].match(/^town$/i)) {
		id = jsondata.officialmapids["Stunt"][mapname];
	}
	return id;
};

var checkPlay = function(args) {
	var mapname = "Stunt Playground";
	var id = 0;
	if (args[0].match(/^stunt$/i) && args[2].match(/^playground$/i)) {
		id = jsondata.officialmapids["Stunt"][mapname];
	}
	return id;
};

var checkTagtastic = function(args) {
	var mapname = "Tagtastic";
	var id = 0;
	if (args[0].match(/^tagtastic$/i)) {
		id = jsondata.officialmapids["Stunt"][mapname];
	}
	return id;
};

var individualMaps = [
	checkBS,
	checkLS,
	checkNS,
	checkDep,
	checkFric,
	checkAft,
	checkMachines,
	checkAmus,
	checkCorrup,
	checkObs,
	checkDiss,
	checkFall,
	checkMon,
	checkUncanny,
	checkDodge,
	checkThunder,
	checkGrind,
	checkDesc,
	checkDeta,
	checkElev,
	checkCredits,
	checkRefrac,
	checkSpace,
	checkSpooky,
	checkPlay,
	checkTagtastic
];

var checkMapID = function checkMapID(message, args) {
	var mapid = 0;
	var totalMaps = individualMaps.length;
	i = 0;
	for (i; i < totalMaps + 1; i++) {
		if (typeof mapid === "string") {
			return mapid;
		} else if (i < totalMaps && mapid === 0) {
			mapid = individualMaps[i](args);
		} else if (i === totalMaps && mapid === 0) {
			return mapid;
		}
	}
	return mapid;
};

module.exports = {
	checkMapID
};
