//const sm = require("../util/scoremanager.js");
const connection = require("../util/connection.js");
const send = require("../util/sendMessage.js");
const colors = require("colors");

var getWinners = (msg, winnerCount) => {
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
				message += `\n${i+1}. ${msg.guild.members.get(win[i].userid)} with ${win[i].likelihood} entries`;
			}
			message += `\nCongratulations! (max ${win[0].entries} entries)`;
			resolve(message);
		}).catch(e => reject(e));
	});
};

var getCurrentEntrants = (channel, topMessage) => {
	return new Promise((resolve, reject) => {
		connection.select("COUNT(*) as count", "giveusers inner join giveaway on giveaway.idgive=giveusers.giveawayid", `server_id='${channel.guild.id}'`).then(c => {
			if (c[0].count === 0) {
				resolve("There are no entrants in the giveaway.");
			} else {
				connection.select("*", "giveusers inner join giveaway on giveaway.idgive=giveusers.giveawayid", `server_id='${channel.guild.id}' order by likelihood desc`).then(users => {
					var maxEntries = users[0].entries;
					var nameArray = [];
					var entriesArray = [];
					var i = 0;
					for (i; i < users.length; i++) {
						if (channel.guild.members.get(users[i].userid)) {
							nameArray.push(channel.guild.members.get(users[i].userid).displayName);
							entriesArray.push(users[i].likelihood);
						} else {
							connection.del("giveusers inner join giveaway on giveaway.idgive=giveusers.giveawayid", `server_id='${channel.guild.id}' AND userid=${users[i].userid}`).then(() => {
								console.log(colors.red(`Deleted user with id '${users[i].userid}' from the giveaway.`));
							}).catch(e => reject(e));
							return getCurrentEntrants(channel);
						}
						//text += `${response[i].rank} - ${cl.getDisplayName(message.guild.members.get(response[i].userid))} - ${response[i].score}\r\n`;
					}
					var fieldsArray = [""];
					i = 0;
					for (i; i < nameArray.length; i++) {
						fieldsArray[i] = {
							name: nameArray[i],
							value: `Entries: ${entriesArray[i]}/${maxEntries}`,
							inline: true
						};
					}
					send(channel, topMessage, {
						embed: {
							color: 3447003,
							title: "__**Giveaway Entrants**__",
							fields: fieldsArray
						}
					}).catch(e => reject(e));
				}).catch(e => {
					reject(e);
				});
			}
		}).catch(e => {
			reject(e);
		});
	});
};

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
				const pre = bot.servConf.get(msg.guild.id).prefix;
				connection.insert("giveaway", info).then(() => {
					return send(msg.channel, `Giveaway started with buy-in cost of ${price} points and ${maxEntries} maximum entries per-person. You may enter by using ${pre}enter`);
				});
			} else {
				return send(msg.channel, "No giveaway currently running.");
			}
		} else {
			response = response[0];
			if (perm >= 2) {
				const pre = bot.servConf.get(msg.guild.id).prefix;
				let command = msg.content.split(" ")[0].slice(pre.length).toLowerCase();
				if (command === "enter") {
					return send(msg.channel, "Roles with permission to give themselves points cannot enter giveaways.");
				}
				connection.select("COUNT(*) as count", "giveusers inner join giveaway on giveaway.idgive=giveusers.giveawayid", `server_id='${msg.guild.id}'`).then(c => {
					c = c[0];
					if (!args[0]) {
						getCurrentEntrants(msg.channel, `You must specify an amount of winners (0 to end with none). There ${(c.count > 1) ? `are ${c.count} entrants` : (c.count === 1) ? "is 1 entrant" : "are 0 entrants"}.`).catch(e => console.error(e));
						//return send(msg.channel, );
						return;
					} else if (isNaN(args[0])) {
						getCurrentEntrants(msg.channel, "The amount of winners must be a number (0 to end with none).").catch(e => console.error(e));
						return;
					}
					var winnerCount = parseInt(args[0]);
					if (c.count === 0 && winnerCount !== 0) {
						return send(msg.channel, "There are no entries. Use 0 to end an empty giveaway.");
					} else if (winnerCount > c.count) {
						return send(msg.channel, `The winner amount cannot be more than the current amount of entrants (${c.count}).`);
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
				//return send(msg.channel, "You cannot start/end a giveaway.");
				getCurrentEntrants(msg.channel, "").catch(e => console.error(e));
				return;
			}
		}
	});
};

exports.conf = {
	guildOnly: true,
	aliases: ["ga"],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "giveaway",
	description: "Start or end a giveaway, or list current participiants.",
	extendedDescription: "",
	usage: "giveaway [entry cost|number of winners] [max entries]"
};
