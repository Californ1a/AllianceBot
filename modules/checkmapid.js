var colors = require("colors");
var jsondata = require("../config/options.json");
var i = 0;

var getMapID = function(results, mapname) {
  i = 0;
  for (i; i < results.length; i++) {
    if (typeof results[i] === "string" && (results[i].match(/^sas$/i) || results[i].match(/^speed$/i) || results[i].match(/^sns$/i) || results[i].match(/^s&s$/i))) {
      id = jsondata.officialmapids["Speed and Style"][mapname];
    }
    else if (typeof results[i] === "string" && (results[i].match(/^s$/i) || results[i].match(/^sprint$/i))) {
      id = jsondata.officialmapids["Sprint"][mapname];
    }
  }
  return id;
};

var checkBS = function(results) {
  var id = 0;
  if (results[1].match(/^broken$/i)) {
    if (typeof results[2] === "string" && results[2].match(/^symmetry$/i)) {
      id = getMapID(results, "Broken Symmetry");
    }
  }
  else if (results[1].match(/^bs$/i)) {
    mapname = "Broken Symmetry";
    id = getMapID(results, "Broken Symmetry");
  }
  return id;
};

var checkLS = function(results) {
  var id = 0;
  if (results[1].match(/^lost$/i)) {
    if (typeof results[2] === "string" && results[2].match(/^society$/i)) {
      id = getMapID(results, "Lost Society");
    }
  }
  else if (results[1].match(/^ls$/i)) {
    id = getMapID(results, "Lost Society");
  }
  return id;
};

var checkNS = function(results) {
  var id = 0;
  if (results[1].match(/^negative$/i)) {
    if (typeof results[2] === "string" && (results[2].match(/^space$/i))) {
      id = getMapID(results, "Negative Space");
    }
  }
  else if (results[1].match(/^ns$/i)) {
    id = getMapID(results, "Negative Space");
  }
  return id;
};

var checkDep = function(results) {
  var id = 0;
  if (results[1].match(/^departure$/i)) {
    id = getMapID(results, "Departure");
  }
  return id;
};

var checkFric = function(results) {
  var id = 0;
  if (results[1].match(/^friction$/i)) {
    id = getMapID(results, "Friction");
  }
  return id;
};

var checkAft = function(results) {
  var id = 0;
  if (results[1].match(/^aftermath$/i)) {
    id = getMapID(results, "Aftermath");
  }
  return id;
};

var checkMachines = function(results) {
  var id = 0;
  if (results[1].match(/^the$/i)) {
    if (typeof results[2] === "string" && results[2].match(/^thing$/i)) {
      if (typeof results[3] === "string" && results[3].match(/^about$/i)) {
        if (typeof results[4] === "string" && results[4].match(/^machines$/i)) {
          id = getMapID(results, "The Thing About Machines");
        }
      }
    }
  }
  else if (results[1].match(/^thing$/i)) {
    if (typeof results[2] === "string" && results[2].match(/^about$/i)) {
      if (typeof results[3] === "string" && results[3].match(/^machines$/i)) {
        id = getMapID(results, "The Thing About Machines");
      }
    }
  }
  else if (results[1].match(/^machines$/i)) {
    id = getMapID(results, "The Thing About Machines");
  }
  else if (results[1].match(/^ttam$/i)) {
    id = getMapID(results, "The Thing About Machines");
  }
  return id;
};

var checkAmus = function(results) {
  var id = 0;
  if (results[1].match(/^amusement$/i)) {
    id = getMapID(results, "Amusement");
  }
  return id;
};

var checkCorrup = function(results) {
  var id = 0;
  if (results[1].match(/^corruption$/i)) {
    id = getMapID(results, "Coppuption");
  }
  return id;
};

var checkObs = function(results) {
  var id = 0;
  if (results[1].match(/^the$/i)) {
    if (typeof results[2] === "string" && results[2].match(/^observer$/i)) { //partial observer
      if (typeof results[3] === "string" && results[3].match(/^effect$/i)) {
        id = getMapID(results, "The Observer Effect");
      }
    }
  }
  else if (results[1].match(/^observer$/i)) {
    id = getMapID(results, "The Observer Effect");
  }
  else if (results[1].match(/^toe$/i)) {
    id = getMapID(results, "The Observer Effect");
  }
  return id;
};

var checkDiss = function(results) {
  var id = 0;
  if (results[1].match(/^dissolution$/i)) {
    id = getMapID(results, "Dissolution");
  }
  return id;
};

var checkFall = function(results) {
  var id = 0;
  if (results[1].match(/^falling$/i)) {
    id = getMapID(results, "Falling Through");
  }
  else if (results[1].match(/^ft$/i)) {
    id = getMapID(results, "Falling Through");
  }
  return id;
};

var checkMon = function(results) {
  var id = 0;
  if (results[1].match(/^monolith$/i)) {
    id = getMapID(results, "Monolith");
  }
  return id;
};

var checkUncanny = function(results) {
  var id = 0;
  if (results[1].match(/^uncanny$/i)) {
    id = getMapID(results, "Uncanny Valley");
  }
  return id;
};

var checkMapID = function checkMapID(message, results) {
  var mapid = 0;
  var totalMaps = Object.keys(jsondata.officialmapids["Sprint"]).length + Object.keys(jsondata.officialmapids["Challenge"]).length;
  i = 0;
  for (i; i < totalMaps + 1; i++) {
    if (typeof mapid === "string") {
      return mapid;
    }
    else if (i === 0 && mapid === 0) {
      mapid = checkBS(results);
    }
    else if (i === 1 && mapid === 0) {
      mapid = checkLS(results);
    }
    else if (i === 2 && mapid === 0) {
      mapid = checkNS(results);
    }
    else if (i === 3 && mapid === 0) {
      mapid = checkDep(results);
    }
    else if (i === 4 && mapid === 0) {
      mapid = checkFric(results);
    }
    else if (i === 5 && mapid === 0) {
      mapid = checkAft(results);
    }
    else if (i === 6 && mapid === 0) {
      mapid = checkMachines(results);
    }
    else if (i === 7 && mapid === 0) {
      mapid = checkAmus(results);
    }
    else if (i === 8 && mapid === 0) {
      mapid = checkCorrup(results);
    }
    else if (i === 9 && mapid === 0) {
      mapid = checkObs(results);
    }
    else if (i === 10 && mapid === 0) {
      mapid = checkDiss(results);
    }
    else if (i === 11 && mapid === 0) {
      mapid = checkFall(results);
    }
    else if (i === 12 && mapid === 0) {
      mapid = checkMon(results);
    }
    else if (i === 13 && mapid === 0) {
      mapid = checkUncanny(results);
    }
    else if (i === 14 && mapid === 0) {
      if (results[1].match(/^dodge$/i)) {
        mapid = jsondata.officialmapids["Challenge"]["Dodge"];
      }
    }
    else if (i === 15 && mapid === 0) {
      if (results[1].match(/^thunder$/i)) {
        if (typeof results[2] === "string" && results[2].match(/^struck$/i)) {
          mapid = jsondata.officialmapids["Challenge"]["Thunder Struck"];
        }
      }
      else if (results[1].match(/^thunderstruck$/i)) {
        mapid = jsondata.officialmapids["Challenge"]["Thunder Struck"];
      }
      else if (results[1].match(/^ts$/i)) {
        mapid = jsondata.officialmapids["Challenge"]["Thunder Struck"];
      }
    }
    else if (i === 16 && mapid === 0) {
      if (results[1].match(/^grinder$/i)) {
        mapid = jsondata.officialmapids["Challenge"]["Grinder"];
      }
    }
    else if (i === 17 && mapid === 0) {
      if (results[1].match(/^descent$/i)) {
        mapid = jsondata.officialmapids["Challenge"]["Descent"];
      }
    }
    else if (i === 18 && mapid === 0) {
      if (results[1].match(/^detached$/i)) {
        mapid = jsondata.officialmapids["Challenge"]["Detached"];
      }
    }
    else if (i === 19 && mapid === 0) {
      if (results[1].match(/^elevation$/i)) {
        mapid = jsondata.officialmapids["Challenge"]["Elevation"];
      }
    }
    else if (i === 20 && mapid === 0) {
      return mapid;
    }
    else {
      var total = jsondata.officialmapids["Sprint"].length+jsondata.officialmapids["Challenge"].length;
      console.log("Wut? " + i + " " + total);
    }
  }
  return mapid;
};

module.exports = {
  checkMapID
};
