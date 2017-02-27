const connection = require("./connection.js");
const colors = require("colors");

var getRndmFromSet = (set) => {
	var rndm = Math.floor(Math.random() * set.length);
	return set[rndm];
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
		}).catch((error) => console.error(error));
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
	getLB
};
