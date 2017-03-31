const connection = require("./connection.js");

var getScore = (guild, member) => {
	return new Promise((resolve, reject) => {
		var usersScore = 0;
		var usersRank = "unranked";
		connection.select(`t1.*, (select  count(*)+1 FROM triviascore as t2 WHERE t2.score > t1.score AND server_id='${guild.id}') as rank`, "triviascore as t1", `userid='${member.id}' AND server_id='${guild.id}' ORDER BY rank`).then(response => {
			if (response[0]) {
				usersRank = response[0].rank;
				usersScore = response[0].score;
			}
			var arr = {
				rank: usersRank,
				score: usersScore
			};
			resolve(arr);
		}).catch(e => reject(e));
	});
};

var setScore = (guild, member, type, amount) => {
	return new Promise((resolve, reject) => {
		getScore(guild, member).then(s => {
			if ((type === "add" && s.score + amount <= 0) || (type === "set" && amount <= 0)) {
				delScore(guild, member, s).then(m => {
					resolve({
						message: m,
						pScore: s.score,
						score: 0,
						pRank: s.rank
					});
				}).catch(e => reject(e));
			} else {
				var newScore;
				if (type === "add") {
					newScore = s.score + amount;
				} else if (type === "set") {
					newScore = amount;
				} else {
					reject(new Error("The type must be set or add."));
				}
				if (s.score > 0) {
					connection.update("triviascore", `score=${newScore}`, `userid='${member.id}' AND server_id='${guild.id}'`).then(() => {
						resolve({
							message: `Set ${member.displayName}'s score to ${newScore}. Their previous score was ${s.score}.`,
							pScore: s.score,
							score: newScore,
							pRank: s.rank
						});
					}).catch(e => reject(e));
				} else {
					var info = {
						"userid": member.id,
						"score": newScore,
						"server_id": guild.id
					};
					connection.insert("triviascore", info).then(() => {
						resolve({
							message: `Added ${member.displayName} to the trivia board with a score of ${amount}.`,
							pScore: s.score,
							score: newScore,
							pRank: s.rank
						});
					}).catch(e => reject(e));
				}
			}
		}).catch(e => reject(e));
	});
};

var delScore = (guild, member, s) => {
	return new Promise((resolve, reject) => {
		connection.del("triviascore", `userid='${member.id}' AND server_id='${guild.id}'`).then(() => {
			resolve(`Removed ${member.displayName} from the trivia board. Their previous score was ${s.score}.`);
		}).catch(e => reject(e));
	});
};



module.exports = {
	getScore,
	setScore
};
