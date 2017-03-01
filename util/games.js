const connection = require("./connection.js");
const colors = require("colors");
// var findIndex = require("array.prototype.findindex");
// findIndex.shim();

var getRndmFromSet = (set) => {
	var rndm = Math.floor(Math.random() * set.length);
	return set[rndm];
};

function arrayUnion(arr1, arr2) {
	var union = arr1.concat(arr2);
	var nameids = [];
	var names = [];
	console.log("union", union);
	var i = 0;
	for (i; i < union.length; i++) {
		var sindex = union[i].sindex;
		var rindex = union[i].rindex;
		if (!nameids.includes(union[i].userid)) {
			nameids.push(union[i].userid);
			names.push(union[i]);
		} else {
			var index = nameids.indexOf(union[i].userid);
			if (names[index].rindex >= 0) {
				names[index].sindex = sindex;
			} else if (names[index].sindex >= 0) {
				names[index].rindex = rindex;
			}
		}
	}
	return names;
}

// function areScoresEqual(g1, g2) {
// 	console.log("g1", g1);
// 	console.log("g2", g2);
// 	return g1.userid === g2.userid;
// }


var getChanges = (channel, startingScores, topMessage, limit) => {
	var combined = [];
	var obj;
	connection.select("userid, score, rank", `(SELECT userid, score, @curRank := IF(@prevRank = score, @curRank, @incRank) AS rank, @incRank := @incRank + 1, @prevRank := score FROM triviascore t, (SELECT @curRank :=0, @prevRank := NULL, @incRank := 1) r WHERE server_id='${channel.guild.id}' ORDER BY score DESC) s`).then(response => {
		if (!response[0] && !startingScores[0]) {
			return channel.sendMessage("There are no trivia scores yet.");
		}
		var i = 0;
		for (i; i < response.length; i++) {
			obj = {"rindex": i, "sindex": -1};
			Object.assign(response[i], obj);
		}
		i = 0;
		for (i; i < startingScores.length; i++) {
			obj = {"sindex": i, "rindex": -1};
			Object.assign(startingScores[i], obj);
		}
		var union = arrayUnion(response, startingScores);
		console.log(union);
		i = 0;
		for (i; i < union.length; i++) {
			if (channel.guild.members.get(union[i].userid)) {
				var sindex = union[i].sindex;
				var current = (union[i].rindex < 0)?0:union[i].score;
				var change = current;
				if (union[i].sindex >= 0 && union[i].rindex >= 0) {
					change -= startingScores[sindex].score;
				} else if (union[i].rindex < 0) {
					change = union[i].score*-1;
				}
				if (change > 0) {
					combined.push({
						"userid": union[i].userid,
						"name": channel.guild.members.get(union[i].userid).displayName,
						"currentscore": current,
						"scorechange": change,
						"rank": union[i].rank
					});
				}
			} else {
				connection.del("triviascore", `server_id='${channel.guild.id}' AND userid=${response[i].userid}`).then(() => {
					console.log(colors.red(`Deleted user with id '${response[i].userid}' from the leaderboard.`));
				}).catch(e => console.error(e.stack));
				return getChanges(channel, startingScores, topMessage, limit);
			}
		}
		combined.sort((a, b) => {
			return b.scorechange - a.scorechange;
		});
		combined.splice(limit);
		var fieldsArray = [];
		i = 0;
		for (i; i < combined.length; i++) {
			fieldsArray[i] = {
				name: combined[i].name,
				value: `Rank: ${(combined[i].currentscore > 0)?combined[i].rank:"unranked"}, Score: ${combined[i].currentscore}(${(combined[i].scorechange >= 0)?"+":""}${combined[i].scorechange})`,
				inline: true
			};
		}
		channel.sendMessage(topMessage, {
			embed: {
				color: 3447003,
				title: `__**Top ${fieldsArray.length} Scoreboard**__`,
				fields: fieldsArray
			}
		}).catch(e => console.error(e.stack));
	}).catch(e => console.error(e.stack));
};

var getLB = (channel, topMessage, limit) => {
	connection.select("userid, score, rank", `(SELECT userid, score, @curRank := IF(@prevRank = score, @curRank, @incRank) AS rank, @incRank := @incRank + 1, @prevRank := score FROM triviascore t, (SELECT @curRank :=0, @prevRank := NULL, @incRank := 1) r WHERE server_id='${channel.guild.id}' ORDER BY score DESC) s LIMIT ${limit}`).then(response => {
		if (!response[0]) {
			return channel.sendMessage("There are no trivia scores yet.");
		}
		//var text = "";
		var nameArray = [];
		var scoreArray = [];
		var rankArray = [];
		var i = 0;
		for (i; i < response.length; i++) {
			if (channel.guild.members.get(response[i].userid)) {
				nameArray.push(channel.guild.members.get(response[i].userid).displayName);
				scoreArray.push(response[i].score);
				rankArray.push(response[i].rank);
			} else {
				connection.del("triviascore", `server_id='${channel.guild.id}' AND userid=${response[i].userid}`).then(() => {
					console.log(colors.red(`Deleted user with id '${response[i].userid}' from the leaderboard.`));
				}).catch(e => console.error(e.stack));
				return getLB(channel, topMessage, limit);
			}
			//text += `${response[i].rank} - ${cl.getDisplayName(message.guild.members.get(response[i].userid))} - ${response[i].score}\r\n`;
		}
		var fieldsArray = [""];
		i = 0;
		for (i; i < nameArray.length; i++) {
			fieldsArray[i] = {
				name: nameArray[i],
				value: `Rank: ${rankArray[i]}, Score: ${scoreArray[i]}`,
				inline: true
			};
		}
		channel.sendMessage(topMessage, {
			embed: {
				color: 3447003,
				title: `__**Top ${fieldsArray.length} Scoreboard**__`,
				fields: fieldsArray
			}
		}).catch(e => console.error(e.stack));
	}).catch(e => console.error(e.stack));
};

var cooldown = (cmd) => {
	cmd.conf.endGameCooldown = true;
	setTimeout(() => {
		cmd.conf.endGameCooldown = false;
	}, cmd.conf.endGameTimer);
};

module.exports = {
	getRndmFromSet,
	cooldown,
	getLB,
	getChanges
};
