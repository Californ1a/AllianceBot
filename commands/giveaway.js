//const sm = require("../util/scoremanager.js");
const connection = require("../util/connection.js");
const send = require("../util/sendMessage.js");
const colors = require("colors");

const delWinners = (guild, winnerArray) => {
	return new Promise((resolve, reject) => {
		let i = 0;
		for (i; i < winnerArray.length; i++) {
			connection.del("giveusers", "giveusers inner join giveaway on giveusers.giveawayid=giveaway.idgive", `server_id='${guild.id}' AND userid='${winnerArray[i].userid}'`).catch(e => reject(e));
		}
	});
};

const getWinners = (msg, winnerCount) => {
	return new Promise((resolve, reject) => {
		connection.select("*", "giveusers inner join giveaway on giveusers.giveawayid=giveaway.idgive", `server_id='${msg.channel.guild.id}' order by -log(rand())/((likelihood/entries)*100) limit ${winnerCount}`).then(win => {
			let message = "Winners:";
			let i = 0;
			let winners = [];
			for (i; i < win.length; i++) {
				if (!msg.channel.guild.members.cache.get(win[i].userid) || `${msg.channel.guild.members.cache.get(win[i].userid)}` === "undefined") {
					connection.del("giveusers", "giveusers inner join giveaway on giveusers.giveawayid=giveaway.idgive", `server_id='${msg.channel.guild.id}' AND userid='${win[i].userid}'`).then(() => {
						winners = [];
						return getWinners(msg, winnerCount);
					}).catch(e => reject(e));
				}
				message += `\n${i+1}. ${msg.channel.guild.members.cache.get(win[i].userid)} with ${(win[i].likelihood === 1)?"1 entry":`${win[i].likelihood} entries`}`;
				winners.push(win[i]);
			}
			delWinners(msg.channel.guild, winners);
			message += `\nCongratulations! (max ${(win[0].entries === 1)?"1 entry":`${win[0].entries} entries`})`;
			resolve(message);
		}).catch(e => reject(e));
	});
};

const getCurrentEntrants = (channel, topMessage) => {
	return new Promise((resolve, reject) => {
		connection.select("COUNT(*) as count", "giveusers inner join giveaway on giveaway.idgive=giveusers.giveawayid", `server_id='${channel.guild.id}'`).then(c => {
			if (!c[0].count) {
				resolve(send(channel, "There are no entrants in the giveaway."));
			} else {
				connection.select("*", "giveusers inner join giveaway on giveaway.idgive=giveusers.giveawayid", `server_id='${channel.guild.id}' order by likelihood desc`).then(users => {
					const maxEntries = users[0].entries;
					const nameArray = [];
					const entriesArray = [];
					let i = 0;
					for (i; i < users.length; i++) {
						if (channel.guild.members.cache.get(users[i].userid)) {
							nameArray.push(channel.guild.members.cache.get(users[i].userid).displayName);
							entriesArray.push(users[i].likelihood);
						} else {
							connection.del("giveusers", "giveusers inner join giveaway on giveaway.idgive=giveusers.giveawayid", `server_id='${channel.guild.id}' AND userid='${users[i].userid}'`).then(() => {
								console.log(colors.red(`Deleted user with id '${users[i].userid}' from the giveaway.`));
							}).catch(e => reject(e));
							return getCurrentEntrants(channel);
						}
						//text += `${response[i].rank} - ${cl.getDisplayName(message.guild.members.cache.get(response[i].userid))} - ${response[i].score}\r\n`;
					}
					const fieldsArray = [""];
					i = 0;
					for (i; i < nameArray.length; i++) {
						fieldsArray[i] = {
							name: nameArray[i],
							value: `Entries: ${entriesArray[i]}/${maxEntries}`,
							inline: true
						};
					}
					resolve(send(channel, {
						content: topMessage,
						embeds: [{
							color: 3447003,
							title: "__**Giveaway Entrants**__",
							fields: fieldsArray
						}]
					}).catch(e => reject(e)));
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
	connection.select("*", "giveaway", `server_id='${msg.channel.guild.id}'`).then(response => {
		if (!response[0]) {
			if (perm >= 2) {
				if (!args[0] || !args[1]) {
					return send(msg.channel, "No giveaway is currently running. You must specify a cost amount and maximum number of entries per-person to start a giveaway.");
				} else if (isNaN(args[0]) && isNaN(args[1])) {
					return send(msg.channel, "The cost must be number.");
				}
				let price = parseInt(args[0]);
				if (price > 9999) {
					price = 9999;
				} else if (price <= 0) {
					price = 0;
				}
				let maxEntries = parseInt(args[1]);
				if (maxEntries > 9999) {
					maxEntries = 9999;
				} else if (maxEntries <= 0) {
					maxEntries = 0;
				}
				const info = {
					"server_id": msg.channel.guild.id,
					"cost": price,
					"entries": maxEntries
				};
				const pre = bot.servConf.get(msg.channel.guild.id).prefix;
				connection.insert("giveaway", info).then(() => {
					return send(msg.channel, `Giveaway started with buy-in cost of ${price} points and ${maxEntries} maximum entries per-person. You may enter by using ${pre}enter`);
				});
			} else {
				return send(msg.channel, "No giveaway currently running.");
			}
		} else {
			response = response[0];
			if (perm >= 2) {
				// const pre = bot.servConf.get(msg.guild.id).prefix;
				// let command = msg.content.split(" ")[0].slice(pre.length).toLowerCase();
				// if (command === "enter") {
				// 	return send(msg.channel, "Roles with permission to give themselves points cannot enter giveaways.");
				// }
				connection.select("COUNT(*) as count", "giveusers inner join giveaway on giveaway.idgive=giveusers.giveawayid", `server_id='${msg.channel.guild.id}'`).then(c => {
					c = c[0];
					if (!args[0]) {
						getCurrentEntrants(msg.channel, `You must specify an amount of winners (0 to end with none). There ${(c.count > 1) ? `are ${c.count} entrants` : (c.count === 1) ? "is 1 entrant" : "are 0 entrants"}.`).catch(e => console.error(e));
						//return send(msg.channel, );
						return;
					} else if (isNaN(args[0])) {
						getCurrentEntrants(msg.channel, "The amount of winners must be a number (0 to end with none).").catch(e => console.error(e));
						return;
					}
					const winnerCount = parseInt(args[0]);
					if (c.count === 0 && winnerCount !== 0) {
						return send(msg.channel, "There are no entries. Use 0 to end an empty giveaway.");
					} else if (winnerCount > c.count) {
						return send(msg.channel, `The winner amount cannot be more than the current amount of entrants (${c.count}).`);
					} else {
						send(msg.channel, `A giveaway is currently running with ${(c.count > 1) ? `${c.count} entrants. Do you want to end it ${(winnerCount > 0)?`and draw ${winnerCount} random ${(winnerCount === 1) ? "winner" : "winners"}`:"with no winners"}? [y/n]` : (c.count === 1) ? "1 entrant. Do you want to end it and remove all entrants? [y/n]" : "0 entrants. Do you want to end it? [y/n]"}`).then(() => {
							msg.channel.awaitMessages(respond => (respond.author.id === msg.author.id && (respond.content === "yes" || respond.content === "no" || respond.content === "n" || respond.content === "y")), {
								max: 1,
								time: 20000,
								errors: ["time"]
							}).then((collected) => {
								if (collected.first().content === "no" || collected.first().content === "n") {
									return send(msg.channel, "Giveaway will continue.");
								} else if (winnerCount === 0) {
									send(msg.channel, "Giveaway ended with no winners.").then(() => {
										connection.del("giveaway", `server_id="${msg.channel.guild.id}"`).catch(console.error);
										return;
									});
								} else {
									getWinners(msg, winnerCount).then(m => {
										send(msg.channel, m);
										connection.del("giveaway", `server_id='${msg.channel.guild.id}'`).catch(console.error);
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
