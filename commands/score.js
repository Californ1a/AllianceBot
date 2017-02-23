const connection = require("../util/connection.js");
const game = require("../util/game.js");

function getRankScore(guildid, userid) {
	return new Promise((resolve, reject) => {
		var usersScore = 0;
		var usersRank = "unranked";
		connection.select("userid, score, rank", `(SELECT userid, score, @curRank := IF(@prevRank = score, @curRank, @incRank) AS rank, @incRank := @incRank + 1, @prevRank := score FROM triviascore t, (SELECT @curRank :=0, @prevRank := NULL, @incRank := 1) r WHERE server_id='${guildid}' ORDER BY score DESC) s`, `userid='${userid}'`).then(response => {
			if (response[0]) {
				usersRank = response[0].rank;
				usersScore = response[0].score;
			}
			var arr = [usersRank, usersScore];
			resolve(arr);
		}).catch(e => reject(e));
	});
}

exports.run = (bot, msg, args, perm) => {
	var mentionedMember;
	if (!args[0]) {
		getRankScore(msg.guild.id, msg.author.id).then(scores => {
			msg.reply(`Your Rank: ${scores[0]}, Your Score: ${scores[1]}`);
		}).catch(e => console.error(e.stack));
	} else if (args.length === 1 && msg.mentions.users.first()) {
		mentionedMember = msg.guild.members.get(msg.mentions.users.first().id);
		getRankScore(msg.guild.id, mentionedMember.id).then(scores => {
			msg.channel.sendMessage(`Rank: ${scores[0]}, Score: ${scores[1]}`);
		}).catch(e => console.error(e.stack));
	} else if (args[0] === "board" || args[0] === "b") {
		var limit = 9;
		if (perm >= 2 && (args[1] === "full" || args[1] === "f")) {
			limit = 999;
		}
		getRankScore(msg.guild.id, msg.author.id).then(scores => {
			game.getLB(msg.channel, `Your Rank: ${scores[0]}, Your Score: ${scores[1]}`, limit);
		}).catch(e => console.error(e.stack));
		return;
	} else if (args.length === 3 && args[0] === "set") {
		if (!(perm >= 2)) {
			return msg.channel.sendMessage("You do not have permission to set scores.");
		}
		if (!msg.mentions.users.first()) {
			return msg.channel.sendMessage("Incorrect syntax.");
		}
		if (isNaN(args[2])) {
			return msg.channel.sendMessage("The score must be a number.");
		}
		mentionedMember = msg.guild.members.get(msg.mentions.users.first().id);
		connection.select("*", "triviascore", `userid='${mentionedMember.id}' AND server_id='${msg.guild.id}'`).then(response => {
			if (!response[0]) {
				if (!isNaN(args[2]) && args[2] > 0) {
					var info = {
						"userid": mentionedMember.id,
						"score": args[2],
						"server_id": msg.guild.id
					};
					connection.insert("triviascore", info).then(() => {
						return msg.channel.sendMessage(`Added ${mentionedMember.displayName} to the trivia board with a score of ${args[2]}.`);
					}).catch(e => console.error(e.stack));
				}
				return;
			}
			if (args[2] > 0) {
				connection.update("triviascore", `score=${args[2]}`, `userid='${mentionedMember.id}' AND server_id='${msg.guild.id}'`).then(() => {
					return msg.channel.sendMessage(`Set ${mentionedMember.displayName}'s score to ${args[2]}. Their previous score was ${response[0].score}.`);
				}).catch(e => {
					msg.channel.sendMessage("Failed");
					console.error(e.stack);
					return;
				});
				return;
			}
			connection.del("triviascore", `userid='${mentionedMember.id}' AND server_id='${msg.guild.id}'`).then(() => {
				return msg.channel.sendMessage(`Removed ${mentionedMember.displayName} from the trivia board. Their previous score was ${response[0].score}.`);
			}).catch(e => {
				msg.channel.sendMessage("Failed");
				console.error(e.stack);
				return;
			});
		}).catch(e => console.error(e.stack));
	} else if (args.length === 3 && args[0] === "give") {
		if (!(perm >= 2)) {
			return msg.channel.sendMessage("You do not have permission to set scores.");
		}
		if (!msg.mentions.users.first()) {
			return msg.channel.sendMessage("Incorrect syntax.");
		}
		if (isNaN(args[2])) {
			return msg.channel.sendMessage("The score must be a number.");
		}
		mentionedMember = msg.guild.members.get(msg.mentions.users.first().id);
		connection.select("*", "triviascore", `userid='${mentionedMember.id}' AND server_id='${msg.guild.id}'`).then(response => {
			if (!response[0]) {
				if (!(args[2] > 0)) {
					return msg.channel.sendMessage("The score for this user must be a positive number; they are already not on the board.");
				}
				var info = {
					"userid": mentionedMember.id,
					"score": args[2],
					"server_id": msg.guild.id
				};
				connection.insert("triviascore", info).then(() => {
					return msg.channel.sendMessage(`Added ${mentionedMember.displayName} to the trivia board with a score of ${args[2]}.`);
				}).catch(e => console.error(e.stack));
				return;
			}
			var newScore = parseInt(response[0].score) + parseInt(args[2]);
			if (!(newScore > 0)) {
				connection.del("triviascore", `userid='${mentionedMember.id}' AND server_id='${msg.guild.id}'`).then(() => {
					return msg.channel.sendMessage(`Removed ${mentionedMember.displayName} from the trivia board. Their previous score was ${response[0].score}.`);
				}).catch(e => {
					msg.channel.sendMessage("Failed");
					console.error(e.stack);
					return;
				});
				return;
			}
			connection.update("triviascore", `score=${newScore}`, `userid='${mentionedMember.id}' AND server_id='${msg.guild.id}'`).then(() => {
				return msg.channel.sendMessage(`Set ${mentionedMember.displayName}'s score to ${newScore}. Their previous score was ${response[0].score}.`);
			}).catch(e => {
				msg.channel.sendMessage("Failed");
				console.error(e.stack);
				return;
			});
		}).catch(e => console.error(e.stack));
	} else if (args[0] === "clear") {
		if (!(perm >= 2)) {
			return msg.channel.sendMessage("You do not have permission to clear the leaderboards.");
		}
		msg.channel.sendMessage("Are you absolutely sure you want to completely clear the trivia leaderboards? y/n");
		msg.channel.awaitMessages(respond => (respond.content === "yes" || respond.content === "no" || respond.content === "n" || respond.content === "y"), {
			max: 1,
			time: 10000,
			errors: ["time"],
		}).then((collected) => {
			if (collected.first().content === "no" || collected.first().content === "n") {
				return msg.channel.sendMessage("Boards remain intact.");
			}
			connection.del("triviascore", `server_id='${msg.guild.id}'`).then(() => {
				return msg.channel.sendMessage("Successfully cleared the trivia leaderboard.");
			}).catch(e => console.error(e.stack));
		}).catch(() => {
			return msg.channel.sendMessage("Did not reply in time. Boards left unchanged.");
		});
	} else {
		msg.channel.sendMessage("Incorrect syntax.");
	}
};

exports.conf = {
	guildOnly: false,
	aliases: ["s"],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "score",
	description: "Get your score/rank, other's score/rank, or set score.",
	extendedDescription: "",
	usage: "score [@mention|board(b)|set|give] [<@mention>] [<score>]"
};
