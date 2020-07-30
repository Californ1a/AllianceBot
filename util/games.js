const connection = require("./connection.js");
const colors = require("colors");
const send = require("./sendMessage.js");
// var findIndex = require("array.prototype.findindex");
// findIndex.shim();

const getRndmFromSet = (set) => {
	const rndm = Math.floor(Math.random() * set.length);
	return set[rndm];
};

function arrayUnion(arr1, arr2) {
	const union = arr1.concat(arr2);
	//console.log("arr1", arr1);
	//console.log("arr2", arr2);
	const nameids = [];
	const names = [];
	let i = 0;
	for (i; i < union.length; i++) {
		const sindex = union[i].sindex;
		const rindex = union[i].rindex;
		if (!nameids.includes(union[i].userid)) {
			nameids.push(union[i].userid);
			names.push(union[i]);
		} else {
			const index = nameids.indexOf(union[i].userid);
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


const getChanges = (channel, startingScores, topMessage, limit) => {
	const combined = [];
	let obj;
	connection.select(`t1.*, (select  count(*)+1 FROM triviascore as t2 WHERE t2.score > t1.score AND server_id='${channel.guild.id}') as rank`, "triviascore as t1", `server_id='${channel.guild.id}' ORDER BY rank`).then(response => {
		if (!response[0] && !startingScores[0]) {
			return send(channel, "There are no trivia scores yet.");
		}
		let i = 0;
		for (i; i < response.length; i++) {
			obj = {
				"rindex": i,
				"sindex": -1
			};
			Object.assign(response[i], obj);
		}
		i = 0;
		for (i; i < startingScores.length; i++) {
			obj = {
				"sindex": i,
				"rindex": -1
			};
			Object.assign(startingScores[i], obj);
		}
		const union = arrayUnion(response, startingScores);
		//console.log(union);
		i = 0;
		for (i; i < union.length; i++) {
			if (channel.guild.members.cache.get(union[i].userid)) {
				const sindex = union[i].sindex;
				const current = (union[i].rindex < 0) ? 0 : union[i].score;
				let change = current;
				if (union[i].sindex >= 0 && union[i].rindex >= 0) {
					change -= startingScores[sindex].score;
				} else if (union[i].rindex < 0) {
					change = union[i].score * -1;
				}
				if (Math.abs(change) > 0) {
					combined.push({
						"userid": union[i].userid,
						"name": channel.guild.members.cache.get(union[i].userid).displayName,
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
		const fieldsArray = [];
		i = 0;
		for (i; i < combined.length; i++) {
			fieldsArray[i] = {
				name: combined[i].name,
				value: `Rank: ${(combined[i].currentscore > 0)?combined[i].rank:"unranked"}, Score: ${combined[i].currentscore}(${(combined[i].scorechange >= 0)?"+":""}${combined[i].scorechange})`,
				inline: true
			};
		}
		send(channel, topMessage, {
			embed: {
				color: 3447003,
				title: `__**Top ${fieldsArray.length} Scoreboard**__`,
				fields: fieldsArray
			}
		}).catch(e => console.error(e.stack));
	}).catch(e => console.error(e.stack));
};

const getLB = (channel, topMessage, limit) => {
	connection.select(`t1.*, (select  count(*)+1 FROM triviascore as t2 WHERE t2.score > t1.score AND server_id='${channel.guild.id}') as rank`, "triviascore as t1", `server_id='${channel.guild.id}' ORDER BY rank LIMIT ${limit}`).then(response => {
		if (!response[0]) {
			return send(channel, "There are no trivia scores yet.");
		}
		//var text = "";
		const nameArray = [];
		const scoreArray = [];
		const rankArray = [];
		let i = 0;
		for (i; i < response.length; i++) {
			if (channel.guild.members.cache.get(response[i].userid)) {
				nameArray.push(channel.guild.members.cache.get(response[i].userid).displayName);
				scoreArray.push(response[i].score);
				rankArray.push(response[i].rank);
			} else {
				connection.del("triviascore", `server_id='${channel.guild.id}' AND userid=${response[i].userid}`).then(() => {
					console.log(colors.red(`Deleted user with id '${response[i].userid}' from the leaderboard.`));
				}).catch(e => console.error(e.stack));
				return getLB(channel, topMessage, limit);
			}
			//text += `${response[i].rank} - ${cl.getDisplayName(message.guild.members.cache.get(response[i].userid))} - ${response[i].score}\r\n`;
		}
		const fieldsArray = [""];
		i = 0;
		for (i; i < nameArray.length; i++) {
			fieldsArray[i] = {
				name: nameArray[i],
				value: `Rank: ${rankArray[i]}, Score: ${scoreArray[i]}`,
				inline: true
			};
		}
		send(channel, topMessage, {
			embed: {
				color: 3447003,
				title: `__**Top ${fieldsArray.length} Scoreboard**__`,
				fields: fieldsArray
			}
		}).catch(e => console.error(e.stack));
	}).catch(e => console.error(e.stack));
};

const cooldown = (cmd) => {
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
