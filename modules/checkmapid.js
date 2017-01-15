//const colors = require("colors");
const jsondata = require("../config/options.json");
var i = 0;

var getMapID = function(results, mapname) {
	i = 0;
	var id = 0;
	if (!(results[results.length-1].match(/^s$/i) || results[results.length-1].match(/^sprint$/i) || results[results.length-1].match(/^sas$/i) || results[results.length-1].match(/^speed$/i) || results[results.length-1].match(/^sns$/i) || results[results.length-1].match(/^s&s$/i))) {
		id = jsondata.officialmapids["Sprint"][mapname];
	} else {
		if (typeof results[i] === "string" && (results[i].match(/^sas$/i) || results[i].match(/^speed$/i) || results[i].match(/^sns$/i) || results[i].match(/^s&s$/i))) {
			id = jsondata.officialmapids["Speed and Style"][mapname];
		} else if (typeof results[i] === "string" && (results[i].match(/^s$/i) || results[i].match(/^sprint$/i))) {
			id = jsondata.officialmapids["Sprint"][mapname];
		}
	}
	return id;
};

var checkBS = function(results) {
	var mapname = "Broken Symmetry";
	var id = 0;
	if (results[1].match(/^broken$/i)) {
		if (typeof results[2] === "string" && results[2].match(/^symmetry$/i)) {
			id = getMapID(results, mapname);
		}
	} else if (results[1].match(/^bs$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkLS = function(results) {
	var mapname = "Lost Society";
	var id = 0;
	if (results[1].match(/^lost$/i)) {
		if (typeof results[2] === "string" && results[2].match(/^society$/i)) {
			id = getMapID(results, mapname);
		}
	} else if (results[1].match(/^ls$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkNS = function(results) {
	var mapname = "Negative Space";
	var id = 0;
	if (results[1].match(/^negative$/i)) {
		if (typeof results[2] === "string" && (results[2].match(/^space$/i))) {
			id = getMapID(results, mapname);
		}
	} else if (results[1].match(/^ns$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkDep = function(results) {
	var mapname = "Departure";
	var id = 0;
	if (results[1].match(/^departure$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkFric = function(results) {
	var mapname = "Friction";
	var id = 0;
	if (results[1].match(/^friction$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkAft = function(results) {
	var mapname = "Aftermath";
	var id = 0;
	if (results[1].match(/^aftermath$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkMachines = function(results) {
	var mapname = "The Thing About Machines";
	var id = 0;
	if (results[1].match(/^the$/i)) {
		if (typeof results[2] === "string" && results[2].match(/^thing$/i)) {
			if (typeof results[3] === "string" && results[3].match(/^about$/i)) {
				if (typeof results[4] === "string" && results[4].match(/^machines$/i)) {
					id = getMapID(results, mapname);
				}
			}
		}
	} else if (results[1].match(/^thing$/i)) {
		if (typeof results[2] === "string" && results[2].match(/^about$/i)) {
			if (typeof results[3] === "string" && results[3].match(/^machines$/i)) {
				id = getMapID(results, mapname);
			}
		}
	} else if (results[1].match(/^machines$/i)) {
		id = getMapID(results, mapname);
	} else if (results[1].match(/^ttam$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkAmus = function(results) {
	var mapname = "Amusement";
	var id = 0;
	if (results[1].match(/^amusement$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkCorrup = function(results) {
	var mapname = "Corruption";
	var id = 0;
	if (results[1].match(/^corruption$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkObs = function(results) {
	var mapname = "The Observer Effect";
	var id = 0;
	if (results[1].match(/^the$/i)) {
		if (typeof results[2] === "string" && results[2].match(/^observer$/i)) { //partial observer
			if (typeof results[3] === "string" && results[3].match(/^effect$/i)) {
				id = getMapID(results, mapname);
			}
		}
	} else if (results[1].match(/^observer$/i)) {
		id = getMapID(results, "The Observer Effect");
	} else if (results[1].match(/^toe$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkDiss = function(results) {
	var mapname = "Dissolution";
	var id = 0;
	if (results[1].match(/^dissolution$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkFall = function(results) {
	var mapname = "Falling Through";
	var id = 0;
	if (results[1].match(/^falling$/i)) {
		id = getMapID(results, mapname);
	} else if (results[1].match(/^ft$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkMon = function(results) {
	var mapname = "Monolith";
	var id = 0;
	if (results[1].match(/^monolith$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkUncanny = function(results) {
	var mapname = "Uncanny Valley";
	var id = 0;
	if (results[1].match(/^uncanny$/i)) {
		id = getMapID(results, mapname);
	}
	return id;
};

var checkDodge = function(results) {
	var mapname = "Dodge";
	var id = 0;
	if (results[1].match(/^dodge$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkThunder = function(results) {
	var mapname = "Thunder Struck";
	var id = 0;
	if (results[1].match(/^thunder$/i)) {
		if (typeof results[2] === "string" && results[2].match(/^struck$/i)) {
			id = jsondata.officialmapids["Challenge"][mapname];
		}
	} else if (results[1].match(/^thunderstruck$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	} else if (results[1].match(/^ts$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkGrind = function(results) {
	var mapname = "Grinder";
	var id = 0;
	if (results[1].match(/^grinder$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkDesc = function(results) {
	var mapname = "Descent";
	var id = 0;
	if (results[1].match(/^descent$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkDeta = function(results) {
	var mapname = "Detached";
	var id = 0;
	if (results[1].match(/^detached$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkElev = function(results) {
	var mapname = "Elevation";
	var id = 0;
	if (results[1].match(/^elevation$/i)) {
		id = jsondata.officialmapids["Challenge"][mapname];
	}
	return id;
};

var checkCredits = function(results) {
	var mapname = "Credits";
	var id = 0;
	if (results[1].match(/^credits$/i)) {
		id = jsondata.officialmapids["Stunt"][mapname];
	}
	return id;
};

var checkRefrac = function(results) {
	var mapname = "Refraction";
	var id = 0;
	if (results[1].match(/^refraction$/i)) {
		id = jsondata.officialmapids["Stunt"][mapname];
	}
	return id;
};

var checkSpace = function(results) {
	var mapname = "Space Skate";
	var id = 0;
	if (results[1].match(/^space$/i) && results[2].match(/^skate$/i)) {
		id = jsondata.officialmapids["Stunt"][mapname];
	}
	return id;
};

var checkSpooky = function(results) {
	var mapname = "Spooky Town";
	var id = 0;
	if (results[1].match(/^spooky$/i) && results[2].match(/^town$/i)) {
		id = jsondata.officialmapids["Stunt"][mapname];
	}
	return id;
};

var checkPlay = function(results) {
	var mapname = "Stunt Playground";
	var id = 0;
	if (results[1].match(/^stunt$/i) && results[2].match(/^playground$/i)) {
		id = jsondata.officialmapids["Stunt"][mapname];
	}
	return id;
};

var checkTagtastic = function(results) {
	var mapname = "Tagtastic";
	var id = 0;
	if (results[1].match(/^tagtastic$/i)) {
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

var checkMapID = function checkMapID(message, results) {
	var mapid = 0;
	var totalMaps = individualMaps.length;
	i = 0;
	for (i; i < totalMaps + 1; i++) {
		if (typeof mapid === "string") {
			return mapid;
		} else if (i < totalMaps && mapid === 0) {
			mapid = individualMaps[i](results);
		} else if (i === totalMaps && mapid === 0) {
			return mapid;
		}
	}
	return mapid;
};

module.exports = {
	checkMapID
};
