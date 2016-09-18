var checkMapID = function checkMapID(message, colors, results, jsondata, mapid) {



  //broken symmetry
  if (results[1].match(/^broken$/i)) {
    if (results[2] !== undefined && results[2].match(/^symmetry$/i)) {
      if (results[3] !== undefined && (results[3].match(/^sas$/i) || results[3].match(/^speed$/i) || results[3].match(/^sns$/i) || results[3].match(/^s&s$/i))) {
        mapid = jsondata.officialmapids["Speed and Style"]["Broken Symmetry"];
      }
      else if (results[3] !== undefined && (results[3].match(/^s$/i) || results[3].match(/^sprint$/i))) {
        mapid = jsondata.officialmapids["Sprint"]["Broken Symmetry"];
      }
      else {
        mapid = 0;
      }
    }
    else {
      mapid = 0;
    }
  }
  else if (results[1].match(/^bs$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Broken Symmetry"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Broken Symmetry"];
    }
    else {
      mapid = 0;
    }
  }


  //lost society
  else if (results[1].match(/^lost$/i)) {
    if (results[2] !== undefined && results[2].match(/^society$/i)) {
      if (results[3] !== undefined && (results[3].match(/^sas$/i) || results[3].match(/^speed$/i)|| results[3].match(/^sns$/i) || results[3].match(/^s&s$/i))) {
        mapid = jsondata.officialmapids["Speed and Style"]["Lost Society"];
      }
      else if (results[3] !== undefined && (results[3].match(/^s$/i) || results[3].match(/^sprint$/i))) {
        mapid = jsondata.officialmapids["Sprint"]["Lost Society"];
      }

      else {
        mapid = 0;
      }
    }
    else {
      mapid = 0;
    }
  }
  else if (results[1].match(/^ls$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Lost Society"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Lost Society"];
    }
    else {
      mapid = 0;
    }
  }


  //negative space
  else if (results[1].match(/^negative$/i)) {
    if (results[2] !== undefined && (results[2].match(/^space$/i))) {
      if (results[3] !== undefined && (results[3].match(/^sas$/i) || results[3].match(/^speed$/i)|| results[3].match(/^sns$/i) || results[3].match(/^s&s$/i))) {
        mapid = jsondata.officialmapids["Speed and Style"]["Negative Space"];
      }
      else if (results[3] !== undefined && (results[3].match(/^s$/i) || results[3].match(/^sprint$/i))) {
        mapid = jsondata.officialmapids["Sprint"]["Negative Space"];
      }
      else {
        mapid = 0;
      }
    }
    else {
      mapid = 0;
    }
  }
  else if (results[1].match(/^ns$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Negative Space"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Negative Space"];
    }
    else {
      mapid = 0;
    }
  }


  //departure
  else if (results[1].match(/^departure$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Departure"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Departure"];
    }
    else {
      mapid = 0;
    }
  }


  //Friction
  else if (results[1].match(/^friction$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Friction"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Friction"];
    }
    else {
      mapid = 0;
    }
  }


  //Aftermath
  else if (results[1].match(/^aftermath$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Aftermath"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Aftermath"];
    }
    else {
      mapid = 0;
    }
  }


  //the thing about machines
  else if (results[1].match(/^the$/i)) {
    if (results[2] !== undefined && results[2].match(/^thing$/i)) {
      if (results[3] !== undefined && results[3].match(/^about$/i)) {
        if (results[4] !== undefined && results[4].match(/^machines$/i)) {
          if (results[5] !== undefined && (results[5].match(/^sas$/i) || results[5].match(/^speed$/i)|| results[5].match(/^sns$/i) || results[5].match(/^s&s$/i))) {
            mapid = jsondata.officialmapids["Speed and Style"]["The Thing About Machines"];
          }
          else if (results[5] !== undefined && (results[5].match(/^s$/i) || results[5].match(/^sprint$/i))) {
            mapid = jsondata.officialmapids["Sprint"]["The Thing About Machines"];
          }
          else {
            mapid = 0;
          }
        }
        else {
          mapid = 0;
        }
      }
      else {
        mapid = 0;
      }
    }
    else if (results[2] !== undefined && results[2].match(/^observer$/i)) { //partial observer
      if (results[3] !== undefined && results[3].match(/^effect$/i)) {
        if (results[4] !== undefined && (results[4].match(/^sas$/i) || results[4].match(/^speed$/i)|| results[4].match(/^sns$/i) || results[4].match(/^s&s$/i))) {
          mapid = jsondata.officialmapids["Speed and Style"]["The Observer Effect"];
        }
        else if (results[4] !== undefined && (results[4].match(/^s$/i) || results[4].match(/^sprint$/i))) {
          mapid = jsondata.officialmapids["Sprint"]["The Observer Effect"];
        }
        else {
          mapid = 0;
        }
      }
      else {
        mapid = 0;
      }
    }
    else {
      mapid = 0;
    }
  }
  else if (results[1].match(/^thing$/i)) {
    if (results[2] !== undefined && results[2].match(/^about$/i)) {
      if (results[3] !== undefined && results[3].match(/^machines$/i)) {
        if (results[4] !== undefined && (results[4].match(/^sas$/i) || results[4].match(/^speed$/i)|| results[4].match(/^sns$/i) || results[4].match(/^s&s$/i))) {
          mapid = jsondata.officialmapids["Speed and Style"]["The Thing About Machines"];
        }
        else if (results[4] !== undefined && (results[4].match(/^s$/i) || results[4].match(/^sprint$/i))) {
          mapid = jsondata.officialmapids["Sprint"]["The Thing About Machines"];
        }
        else {
          mapid = 0;
        }
      }
      else {
        mapid = 0;
      }
    }
    else {
      mapid = 0;
    }
  }
  else if (results[1].match(/^machines$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["The Thing About Machines"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["The Thing About Machines"];
    }
    else {
      mapid = 0;
    }
  }
  else if (results[1].match(/^ttam$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["The Thing About Machines"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["The Thing About Machines"];
    }
    else {
      mapid = 0;
    }
  }


  //Amusement
  else if (results[1].match(/^amusement$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Amusement"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Amusement"];
    }
    else {
      mapid = 0;
    }
  }


  //Corruption
  else if (results[1].match(/^corruption$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Corruption"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Corruption"];
    }
    else {
      mapid = 0;
    }
  }


  //the observer Effect
  else if (results[1].match(/^observer$/i)) {
    if (results[2] !== undefined && results[2].match(/^effect$/i)) {
      if (results[3] !== undefined && (results[3].match(/^sas$/i) || results[3].match(/^speed$/i)|| results[3].match(/^sns$/i) || results[3].match(/^s&s$/i))) {
        mapid = jsondata.officialmapids["Speed and Style"]["The Observer Effect"];
      }
      else if (results[3] !== undefined && (results[3].match(/^s$/i) || results[3].match(/^sprint$/i))) {
        mapid = jsondata.officialmapids["Sprint"]["The Observer Effect"];
      }
      else {
        mapid = 0;
      }
    }
    else {
      if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
        mapid = jsondata.officialmapids["Speed and Style"]["The Observer Effect"];
      }
      else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
        mapid = jsondata.officialmapids["Sprint"]["The Observer Effect"];
      }
      else {
        mapid = 0;
      }
    }
  }
  else if (results[1].match(/^toe$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["The Observer Effect"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["The Observer Effect"];
    }
    else {
      mapid = 0;
    }
  }


  //Dissolution
  else if (results[1].match(/^dissolution$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Dissolution"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Dissolution"];
    }
    else {
      mapid = 0;
    }
  }


  //falling Through
  else if (results[1].match(/^falling$/i)) {
    if (results[2] !== undefined && results[2].match(/^through$/i)) {
      if (results[3] !== undefined && (results[3].match(/^sas$/i) || results[3].match(/^speed$/i)|| results[3].match(/^sns$/i) || results[4].match(/^s&s$/i))) {
        mapid = jsondata.officialmapids["Speed and Style"]["Falling Through"];
      }
      else if (results[3] !== undefined && (results[3].match(/^s$/i) || results[3].match(/^sprint$/i))) {
        mapid = jsondata.officialmapids["Sprint"]["Falling Through"];
      }
      else {
        mapid = 0;
      }
    }
    else if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Falling Through"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Falling Through"];
    }
    else {
      mapid = 0;
    }
  }
  else if (results[1].match(/^ft$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Falling Through"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Falling Through"];
    }
    else {
      mapid = 0;
    }
  }


  //Monolith
  else if (results[1].match(/^monolith$/i)) {
    if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
      mapid = jsondata.officialmapids["Speed and Style"]["Monolith"];
    }
    else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
      mapid = jsondata.officialmapids["Sprint"]["Monolith"];
    }
    else {
      mapid = 0;
    }
  }


  //uncanny Valley
  else if (results[1].match(/^uncanny$/i)) {
    if (results[2] !== undefined && results[2].match(/^valley$/i)) {
      if (results[3] !== undefined && (results[3].match(/^sas$/i) || results[3].match(/^speed$/i)|| results[3].match(/^sns$/i) || results[3].match(/^s&s$/i))) {
        mapid = jsondata.officialmapids["Speed and Style"]["Uncanny Valley"];
      }
      else if (results[3] !== undefined && (results[3].match(/^s$/i) || results[3].match(/^sprint$/i))) {
        mapid = jsondata.officialmapids["Sprint"]["Uncanny Valley"];
      }
      else {
        mapid = 0;
      }
    }
    else {
      if (results[2] !== undefined && (results[2].match(/^sas$/i) || results[2].match(/^speed$/i)|| results[2].match(/^sns$/i) || results[2].match(/^s&s$/i))) {
        mapid = jsondata.officialmapids["Speed and Style"]["Uncanny Valley"];
      }
      else if (results[2] !== undefined && (results[2].match(/^s$/i) || results[2].match(/^sprint$/i))) {
        mapid = jsondata.officialmapids["Sprint"]["Uncanny Valley"];
      }
      else {
        mapid = 0;
      }
    }
  }


  //dodge Challenge
  else if (results[1].match(/^dodge$/i)) {
    mapid = jsondata.officialmapids["Challenge"]["Dodge"];
  }


  //thunder stuck Challenge
  else if (results[1].match(/^thunder$/i)) {
    if (results[2] !== undefined && results[2].match(/^struck$/i)) {
      mapid = jsondata.officialmapids["Challenge"]["Thunder Struck"];
    }
    else {
      mapid = 0;
    }
  }
  else if (results[1].match(/^thunderstruck$/i)) {
    mapid = jsondata.officialmapids["Challenge"]["Thunder Struck"];
  }


  //Grinder
  else if (results[1].match(/^grinder$/i)) {
    mapid = jsondata.officialmapids["Challenge"]["Grinder"];
  }


  //Descent
  else if (results[1].match(/^descent$/i)) {
    mapid = jsondata.officialmapids["Challenge"]["Descent"];
  }


  //Detached
  else if (results[1].match(/^detached$/i)) {
    mapid = jsondata.officialmapids["Challenge"]["Detached"];
  }


  //Elevation
  else if (results[1].match(/^elevation$/i)) {
    mapid = jsondata.officialmapids["Challenge"]["Elevation"];
  }


  //all other cases
  else {
    mapid = 0;
  }
  return mapid;
};

module.exports = {
  checkMapID
};
