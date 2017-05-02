const sm = require("../util/scoremanager.js");
const connection = require("../util/connection.js");
const send = require("../util/sendMessage.js");

function getWinners(msg, winnerCount) {
	return new Promise((resolve, reject) => {
		connection.select("*", "giveusers inner join giveaway on giveusers.giveawayid=giveaway.idgive", `server_id='${msg.guild.id}' order by -log(rand())/((likelihood/entries)*100) limit ${winnerCount}`).then(win => {
			var message = "Winners:";
			var i = 0;
			for (i; i < win.length; i++) {
				if (!msg.guild.members.get(win[i].userid)) {
					connection.del("giveusers inner join giveaway on giveusers.giveawayid=giveaway.idgive", `server_id='${msg.guild.id}' AND userid=${win[i].userid}`).then(() => {
						return getWinners(msg, winnerCount);
					}).catch(e => reject(e));
				}
				message += `\n${msg.guild.members.get(win[i].userid)} with ${win[i].likelihood} entries`;
			}
			message += `\nCongratulations! (max ${win[0].entries} entries)`;
			resolve(message);
		}).catch(e => reject(e));
	});
}

exports.run = (bot, msg, args, perm) => {
	connection.select("*", "giveaway", `server_id='${msg.guild.id}'`).then(response => {
		if (!response[0]) {
			if (perm >= 2) {
				if (!args[0] || !args[1]) {
					return send(msg.channel, "No giveaway is currently running. You must specify a cost amount and maximum number of entries per-person to start a giveaway.");
				} else if (isNaN(args[0]) && isNaN(args[1])) {
					return send(msg.channel, "The cost must be number.");
				}
				var price = parseInt(args[0]);
				if (price > 9999) {
					price = 9999;
				} else if (price <= 0) {
					price = 0;
				}
				var maxEntries = parseInt(args[1]);
				if (maxEntries > 9999) {
					maxEntries = 9999;
				} else if (maxEntries <= 0) {
					maxEntries = 0;
				}
				var info = {
					"server_id": msg.guild.id,
					"cost": price,
					"entries": maxEntries
				};
				connection.insert("giveaway", info).then(() => {
					return send(msg.channel, `Giveaway started with buy-in cost of ${price} points and ${maxEntries} maximum entries per-person.`);
				});
			} else {
				return send(msg.channel, "No giveaway currently running.");
			}
		} else {
			response = response[0];
			if (perm >= 2) {
				connection.select("COUNT(*) as count", "giveusers inner join giveaway on giveaway.idgive=giveusers.giveawayid", `server_id='${msg.guild.id}'`).then(c => {
					c = c[0];
					if (!args[0]) {
						return send(msg.channel, `You must specify an amount of winners (0 to end with none). There ${(c.count > 1) ? `are ${c.count} entrants` : (c.count === 1) ? "is 1 entrant" : "are 0 entrants"}.`);
					} else if (isNaN(args[0])) {
						return send(msg.channel, "The amount of winners must be a number (0 to end with none).");
					}
					var winnerCount = parseInt(args[0]);
					if (c.count === 0 && winnerCount !== 0) {
						return send(msg.channel, "There are no entries. Use 0 to end an empty giveaway.");
					} else if (c.count < winnerCount) {
						return send(msg.channel, `The winner amount cannot be less than the current amount of entrants (${c.count}).`);
					} else {
						send(msg.channel, `A giveaway is currently running with ${(c.count > 1) ? `${c.count} entrants. Do you want to end it, draw ${winnerCount} random ${(winnerCount > 1) ? "winners" : "winner"}, and remove all entrants? [y/n]` : (c.count === 1) ? "1 entrant. Do you want to end it? [y/n]" : "0 entrants. Do you want to end it? [y/n]"}`).then(() => {
							msg.channel.awaitMessages(respond => (respond.author.id === msg.author.id && (respond.content === "yes" || respond.content === "no" || respond.content === "n" || respond.content === "y")), {
								max: 1,
								time: 20000,
								errors: ["time"],
							}).then((collected) => {
								if (collected.first().content === "no" || collected.first().content === "n") {
									return send(msg.channel, "Giveaway will continue.");
								} else if (winnerCount === 0) {
									send(msg.channel, "Giveaway ended with no winners.").then(() => {
										connection.del("giveaway", `server_id='${msg.guild.id}'`).catch(console.error);
										return;
									});
								} else {
									getWinners(msg, winnerCount).then(m => {
										send(msg.channel, m);
										connection.del("giveaway", `server_id='${msg.guild.id}'`).catch(console.error);
									});
								}
							}).catch(() => {
								return send(msg.channel, "Did not reply in time. Giveaway will continue accepting entrants.");
							});
						});
					}
				}).catch(console.error);
			} else {
				sm.getScore(msg.guild, msg.member).then(ret => {
					if (ret.score === 0) {
						return send(msg.channel, "You have no points.");
					} else if (ret.score < response.cost) {
						return send(msg.channel, `You only have ${ret.score} points. You need ${response.cost} to enter the giveaway.`);
					}
					connection.select("*", "giveusers inner join giveaway on giveusers.giveawayid=giveaway.idgive", `userid='${msg.author.id}' AND server_id='${msg.guild.id}'`).then(ent => {
						var info;
						if (ent[0]) {
							if (ent[0].likelihood === response.entries) {
								return send(msg.channel, `You already have the max amount of entries for this giveaway, ${response.entries}`);
							}
							connection.update("giveusers", "likelihood=likelihood+1", `userid='${msg.author.id}' AND giveawayid=${ent[0].giveawayid}`).then(() => {
								sm.setScore(msg.guild, msg.member, "add", response.cost * -1).then(r => {
									return send(msg.channel, `${msg.author}(${r.pScore}=>${r.score}) entered into the giveaway! (${ent[0].likelihood+1}/${response.entries} ${(response.entries > 1) ? "entries" : "entry"})`);
								}).catch(console.error);
							}).catch(console.error);
						} else {
							info = {
								"userid": msg.author.id,
								"giveawayid": response.idgive,
								"likelihood": 1
							};
							connection.insert("giveusers", info).then(() => {
								sm.setScore(msg.guild, msg.member, "add", response.cost * -1).then(r => {
									return send(msg.channel, `${msg.author}(${r.pScore}=>${r.score}) entered into the giveaway! (${info.likelihood}/${response.entries} ${(response.entries > 1) ? "entries" : "entry"})`);
								}).catch(console.error);
							}).catch(console.error);
						}
					}).catch(console.error);
				});
			}
		}
	});
};

exports.conf = {
	guildOnly: false,
	aliases: ["enter", "ga"],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "giveaway",
	description: "Enter a current giveaway, start or end a giveaway.",
	extendedDescription: "",
	usage: "giveaway [entry cost|number of winners] [max entries]"
};
