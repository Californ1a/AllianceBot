const colors = require("colors");
const http = require("http");
const parseString = require("xml2js").parseString;
const jsondata = require("../config/options.json");
const prefix = jsondata.prefix;
const modrolename = jsondata.modrolename;
const membrolename = jsondata.membrolename;
const botowner = jsondata.botownerid;
const commandList = require("../config/commands.json");
const Command = require("./command.js");
const cl = require("./chatinfo.js");
const timers = require("./timers.js");
const sdr = require("./setdelrole.js");
const rw = require("./RipWin.js");
const CheckMapID = require("./checkmapid.js");
const testtweet = require("../tweet2.json"); //test
var info;
var currentss;

var hardCode = [];
var i = 0;
for (i; i < commandList.length; i++) {
	hardCode[i] = new Command(commandList[i]);
}
var ref;
//console.log(hardCode);


var enable = function(message, results, connection) {
	if (message.author.id === botowner || message.guild.owner.equals(message.author)) {
		if (results.length <= 2) {
			if (typeof results[1] !== "string") {
				message.channel.sendMessage("To view the help for this command use `" + prefix + "addcomtoserv help`.");
			} else if (results[1] === "help") {
				message.channel.sendMessage("Syntax: __**`" + prefix + "addcometoserv <command name>`**__\rUsed to enable hardcoded commands on the server, only available to the bot owner and server owner.\r\r`command name`\rName of command without prefix.\r\r**Example**\r`" + prefix + "addcomtoserv advent`\rThis will enable the hardcoded `" + prefix + "advent` command.");
			} else {
				var iscommand = false;
				i = 0;
				for (i; i < hardCode.length; i++) {
					if (hardCode[i].name === results[1]) {
						iscommand = true;
					}
				}
				if (iscommand) {
					if (results[1].includes(prefix)) {
						message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "remcomfromserv help` to view the syntax help.");
					} else {
						//database
						console.log(colors.red("Trying to insert command '" + results[1] + "' into database."));
						info = {
							"commandname": results[1],
							"server_id": message.guild.id,
						};
						connection.query("INSERT INTO commands SET ?", info, function(error) {
							if (error) {
								console.log(error);
								message.channel.sendMessage("Failed.");
								return;
							} else {
								console.log(colors.red("Successfully added command to server."));
								message.channel.sendMessage("Successfully added command to server.");
							}
						});
					}
				} else {
					message.channel.sendMessage("`" + results[1] + "` is not a recognized command.");
				}
			}
		} else {
			message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "addcomtoserv help` to view the syntax help.");
		}
	}
};


var disable = function(message, results, connection) {
	if (message.author.id === botowner || message.guild.owner.equals(message.author)) {
		if (results.length <= 2) {
			if (typeof results[1] !== "string") {
				message.channel.sendMessage("To view the help for this command use `" + prefix + "remcomfromserv help`.");
			} else if (results[1] === "help") {
				message.channel.sendMessage("Syntax: __**`" + prefix + "remcomefromserv <command name>`**__\rDisables a hardcoded command on this server. Only available for bot owner and server owner.\r\r`command name`\rName of the command to be disabled without the prefix.\r\r**Example**\r`" + prefix + "remcomfromserv advent`\rThis will disable the `" + prefix + "advent` command.");
			} else {
				if (results[1].includes(prefix)) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "remcomfromserv help` to view the syntax help.");
				} else {
					//database
					console.log(colors.red("Trying to remove command '" + results[1] + "' from database."));
					connection.query("DELETE FROM commands WHERE commandname='" + results[1] + "' AND server_id=" + message.guild.id, function(error) {
						if (error) {
							console.log(error);
							message.channel.sendMessage("Failed.");
							return;
						} else {
							console.log(colors.red("Successfully removed command from server."));
							message.channel.sendMessage("Successfully removed command from server.");
						}
					});
				}
			}
		} else {
			message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "remcomfromserv help` to view the syntax help.");
		}
	}
};


var newcom = function(message, results, connection) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			if (message.member.roles.exists("name", modrolename)) {
				var str = message.content.toString();
				results = str.split(" ");
				if (typeof results[1] !== "string") {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help.");
				} else if (results[1] === "help") {
					message.channel.sendMessage("Syntax: __**`" + prefix + "newcom <command name> <mod-only> <reply-in-pm> <message>`**__\rUsed to create custom commands.\r\r`command name`\rName of command without prefix\r\r`mod-only (true|false)`\rOnly " + modrolename + "s can use the command.\r\r`reply-in-pm (true|false)`\rReply to command in a PM rather than in-channel.\r\r`message`\rThe message to be sent when command is given.\r\r**Example**\r`" + prefix + "newcom spook false false BOO! Scared ya!`\rThe new command would be `" + prefix + "spook` (enabled for all members, not just " + modrolename + "s & would reply in-channel) and the returned message would be `BOO! Scared ya!`");
				} else if (results[1].includes(prefix)) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help.");
				} else if (results.length === 2) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help.");
				} else if (results.length === 3) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help.");
				} else if (results.length === 4) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help.");
				} else if ((results[2] !== "true") && (results[2] !== "false")) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help. " + results[2]);
				} else if ((results[3] !== "true") && (results[3] !== "false")) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help. " + results[2]);
				} else {
					var recombined = "";
					i = 0;
					for (i; i < results.length - 4; i++) {
						if (i !== results.length - 5) {
							recombined += results[i + 4] + " ";
						} else {
							recombined += results[i + 4];
						}
					}
					console.log(colors.red("Attempting to add the command `" + prefix + results[1] + "` with the resulting message `" + recombined + "` to server `" + message.guild.name + "`."));
					info = {
						"comname": results[1],
						"comtext": "'" + recombined + "'",
						"modonly": results[2],
						"inpm": results[3],
						"server_id": message.guild.id
					};
					connection.query("INSERT INTO servcom SET ?", info, function(error) {
						if (error) {
							console.log(error);
							message.channel.sendMessage("Failed.");
							return;
						} else {
							console.log(colors.red("Successfully inserted command."));
							message.channel.sendMessage("Success.");
						}
					});
				}
			} else {
				message.reply("Only " + modrolename + "s can add commands.");
			}
			hardCode[ref].timeout();
		}
	}).catch((error) => console.error(error));
};

var editcom = function(message, results, connection) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			if (message.member.roles.exists("name", modrolename)) {
				if (typeof results[1] !== "string") {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "editcom help` for help.");
				} else if (results[1] === "help") {
					message.channel.sendMessage("Syntax: __**`" + prefix + "editcom <command name> <mod-only> <reply-in-pm> <message>`**__\rUsed to edit pre-existing custom commands.\r\r`command name`\rName of command without prefix\r\r`mod-only (true|false)`\rOnly " + modrolename + "s can use the command.\r\r`reply-in-pm (true|false)`\rReply to command in a PM rather than in-channel.\r\r`message`\rThe message to be sent when command is given.\r\r**Example**\r`" + prefix + "editcom spook false false BOO! Scared now?`\rThe edited command would be `" + prefix + "spook` (enabled for all members, not just " + modrolename + "s & would reply in-channel) and the returned message would be `BOO! Scared now?`");
				} else if (results[1].includes(prefix)) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "editcom help` for help.");
				} else if (results.length === 2) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "editcom help` for help.");
				} else if (results.length === 3) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "editcom help` for help.");
				} else if (results.length === 4) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "editcom help` for help.");
				} else if ((results[2] !== "true") && (results[2] !== "false")) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "editcom help` for help. " + results[2]);
				} else if ((results[3] !== "true") && (results[3] !== "false")) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "editcom help` for help. " + results[2]);
				} else {
					connection.query("SELECT idservcom FROM servcom WHERE server_id=" + message.guild.id + " AND comname='" + results[1] + "'", function(error, result) {
						if (error) {
							message.channel.sendMessage("Failed.");
							console.log(error);
							return;
						} else {
							if (typeof result[0] !== "object") {
								console.log(colors.red("Command does not exist."));
							} else {
								console.log(colors.red("Command exists."));
								var recombined = "";
								i = 0;
								for (i; i < results.length - 4; i++) {
									if (i !== results.length - 5) {
										recombined += results[i + 4] + " ";
									} else {
										recombined += results[i + 4];
									}
								}
								console.log(colors.red("Attempting to edit the command `" + prefix + results[1] + "` with the resulting message `" + recombined + "` on server `" + message.guild.name + "`."));
								// info = {
								// 	"comname": results[1],
								// 	"comtext": recombined,
								// 	"modonly": results[2],
								// 	"inpm": results[3],
								// 	"server_id": message.guild.id
								// };
								recombined = "''" + recombined + "''";
								console.log(result[0]);
								connection.query("UPDATE servcom SET comtext='" + recombined + "', modonly='" + results[2] + "', inpm='" + results[3] + "' WHERE idservcom=" + result[0].idservcom, function(error) {
									if (error) {
										console.log(error);
										message.channel.sendMessage("Failed.");
										return;
									} else {
										console.log(colors.red("Successfully edited command."));
										message.channel.sendMessage("Success.");
									}
								});
							}
						}
					});
				}
			} else {
				message.reply("Only " + modrolename + "s can edit commands.");
			}
			hardCode[ref].timeout();
		}
	}).catch((error) => console.error(error));
};

var delcom = function(message, results, connection) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			if (message.member.roles.exists("name", modrolename)) {
				if (typeof results[1] !== "string") {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "delcom help` for help.");
				} else if (results[1] === "help") {
					message.channel.sendMessage("Syntax: `" + prefix + "delcom <command name>`\rUsed to delete custom commands.\r\r`command name`\rName of command to be deleted, without prefix.\r\r**Example**\r`" + prefix + "delcom spook`\rThis will remove the `" + prefix + "spook` command.");
				} else if (results[1].includes(prefix)) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "delcom help` for help.");
				} else if (results.length >= 3) {
					message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "delcom help` for help.");
				} else {
					console.log(colors.red("Attempting to remove the command `" + prefix + results[1] + "` from server `" + message.guild.name + "`."));
					connection.query("DELETE FROM servcom WHERE comname='" + results[1] + "' AND server_id=" + message.guild.id, function(error) {
						if (error) {
							console.log(error);
							message.channel.sendMessage("Failed.");
							return;
						} else {
							console.log(colors.red("Successfully removed command."));
							message.channel.sendMessage("Success.");
						}
					});
				}
			} else {
				message.reply("Only " + modrolename + "s can delete commands.");
			}
			hardCode[ref].timeout();
		}
	}).catch((error) => console.error(error));
};

var dist = function(message, results, connection) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			if (typeof results[1] !== "string") {
				message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "dist help` for syntax help.");
			} else if (results[1] === "help") {
				message.channel.sendMessage("Syntax: __**`" + prefix + "dist <map name> <mode>`**__\rReturn the current #1 time/score on a specified map. May take a few seconds to reply, the Steam request can be slow at times.\r\r`map name`\rThe name of the map. Only official maps are supported, no workshop. Abbreviations and full names are both supported (`ttam` = `machines` = `the thing about machines`).\r\r`mode`\rThe mode. This is only necessary when requesting a Speed and Style map (it will default to Sprint because they have the same name, however S&S is currently not supported because the map IDs aren't listed on Steam). Abbreviations for modes is also supported (`speed and style` = `speed` = `sas` = `s&s` | `sprint` = `s`)\r\r**Example**\r`" + prefix + "dist bs` or `" + prefix + "dist broken symmetry`\rBoth would return the best time for Broken Symmetry in Sprint mode.");
			} else {
				var mapid = CheckMapID.checkMapID(message, results);
				if (mapid === 0) {
					message.channel.sendMessage("Incorrect syntax.");
				} else if (typeof mapid === "string" && mapid !== "") {
					var lburl = "<http://steamcommunity.com/stats/233610/leaderboards/" + mapid + ">";
					message.channel.sendMessage(lburl);
					var optionsac = {
						hostname: "steamcommunity.com",
						path: "/stats/233610/leaderboards/" + mapid + "/?xml=1&start=1&end=1",
						method: "GET",
					};
					http.request(optionsac, function(response) {
						var str = "";
						response.on("data", function(chunk) {
							str += chunk;
						});
						response.on("end", function() {
							parseString(str, function(error, result) {
								if (error) {
									console.log(error);
								} else {
									var fulltime = "";
									var sometest = result.response.entries[0].entry[0].score;
									var somesteamid = result.response.entries[0].entry[0].steamid.toString();
									var working = parseInt(sometest.toString(), 10);
									var checkForStunt = false;
									Object.keys(jsondata.officialmapids["Stunt"]).forEach(function(key) {
										if (mapid === jsondata.officialmapids["Stunt"][key]) {
											checkForStunt = true;
										}
									});
									if (!checkForStunt) {
										var wrmin = ((working / 1000) / 60) >> 0;
										var wrsec = (working / 1000) - (wrmin * 60) >> 0;
										var wrmil = (working / 1000).toFixed(3).split(".");
										wrmil = wrmil[1];
										if (wrsec < 10) {
											wrsec = "0" + wrsec;
										}
										fulltime = `${wrmin}:${wrsec}.${wrmil}`;
									} else {
										fulltime = working.toLocaleString("en-US", {
											minimumFractionDigits: 0
										});
									}
									//begin convert steamid64 to profile name
									var optionsac2 = {
										hostname: "steamcommunity.com",
										path: "/profiles/" + somesteamid + "/?xml=1",
										method: "GET",
									};
									http.request(optionsac2, function(response) {
										var str2 = "";
										response.on("data", function(chunk) {
											str2 += chunk;
										});
										response.on("end", function() {
											parseString(str2, function(error, result2) {
												if (error) {
													console.log(error);
												} else {
													var profilename = result2.profile.steamID.toString();
													message.channel.sendMessage(fulltime + " by " + profilename);
												}
											});
										});
									}).end();
								}
							});
						});
					}).end();
				} else {
					message.channel.sendMessage("No data found.");
				}
				hardCode[ref].timeout();
			}
		}
	}).catch((error) => console.error(error));
};

var wr = function(message, results, connection) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			if (typeof results[1] === "string") {
				var str = message.content.toString();
				str = str.substr(str.indexOf(" ") + 1);
				str = str.toLowerCase().split(" ");
				i = 0;
				for (i; i < str.length; i++) {
					str[i] = str[i].split("");
					str[i][0] = str[i][0].toUpperCase();
					str[i] = str[i].join("");
				}
				var category = str.join(" ");
				var gamename = "";
				if (message.guild.name === "Cali Test Server") {
					gamename = "Antichamber";
				} else {
					gamename = message.guild.name;
				}
				var nonefound = true;
				var optionsac = {
					hostname: "www.speedrun.com",
					path: "/api_records.php?game=" + gamename,
					method: "GET",
					json: true
				};
				http.request(optionsac, function(response) {
					var str = "";
					response.on("data", function(chunk) {
						str += chunk;
					});
					response.on("end", function() {
						var actable = JSON.parse(str)[gamename];
						for (var key in actable) {
							if (actable.hasOwnProperty(key)) {
								if (key.indexOf(category) > -1) {
									if (nonefound) {
										var sometime = actable[key].time;
										var working = parseFloat(sometime.toString());
										var wrmin = (working / 60) >> 0;
										var wrsec = working - (wrmin * 60) >> 0;
										var wrmil = working.toFixed(2).split(".");
										wrmil = wrmil[1];
										if (wrsec < 10) {
											wrsec = "0" + wrsec;
										}
										if (typeof actable[key].video !== "string") {
											message.channel.sendMessage(wrmin + ":" + wrsec + "." + wrmil + " by " + actable[key].player + ": No video found.");
											nonefound = false;
										} else {
											message.channel.sendMessage(wrmin + ":" + wrsec + "." + wrmil + " by " + actable[key].player + ": " + actable[key].video);
											nonefound = false;
										}
									}
								}
							}
						}
						if (nonefound) {
							message.channel.sendMessage("No record found for the given category.");
							nonefound = true;
						}
					});
				}).end();
			} else {
				message.channel.sendMessage("Incorrect syntax, category name required.");
			}
			hardCode[ref].timeout();
		}
	}).catch((error) => console.error(error));
};

var ss = function(message, results, connection) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			var forSS = {
				"bool": true
			};
			currentss = timers.getCount(false, "The next SS will begin in ", forSS);
			message.channel.sendMessage(currentss + " Use " + prefix + "speedy for full SS information.");
			hardCode[ref].timeout();
		}
	}).catch((error) => console.error(error));
};

var advent = function(message, results, connection) {
	var eventName;
	var eventDate;
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			connection.query("SELECT * FROM advent WHERE server_id=" + message.guild.id, function(error, eventInfo) {
				if (error) {
					message.channel.sendMessage("Failed.");
					console.log(error);
					return;
				} else {
					if (typeof eventInfo[0] !== "object" && typeof results[1] !== "string") {
						message.channel.sendMessage("No event set.");
					} else if (results[1] === "set" && message.member.roles.exists("name", modrolename)) {
						if (typeof results[2] === "string" && typeof eventInfo[0] !== "object") {
							if (typeof results[3] === "string") {
								eventName = null;
								eventDate = results[2];
								i = 0;
								for (i; i < results.length; i++) {
									if (i === 3) {
										eventName = results[i];
									} else if (i > 3) {
										eventName = eventName + " " + results[i];
									}
								}
								console.log(colors.red("Trying to insert '" + eventName + "' event into database."));
								info = {
									"name": eventName,
									"time": eventDate,
									"server_id": message.guild.id
								};
								connection.query("INSERT INTO advent SET ?", info, function(error) {
									if (error) {
										message.channel.sendMessage("Failed");
										console.log(error);
										return;
									} else {
										console.log(colors.red("Successfully inserted event."));
										message.channel.sendMessage("Event name set to: " + eventName + "\r\nEvent date set to: " + eventDate);
									}
								});
							} else {
								message.channel.sendMessage("Incorrect syntax.");
							}
						} else if (typeof results[2] !== "string") {
							message.channel.sendMessage("Syntax: __**`" + prefix + "advent set <date> <event name>`**__\rCreate an event countdown. Only one event at a time is supported.\r\r`date`\rThe date and time when the event begins. ISO8601 format with no spaces - use T instead of a space to denote the time. Times must be given in Eastern Time unless an offset is defined.\r\r`event name`\rThe name of the event.\r\r**Example**\r`" + prefix + "advent set 2016-02-08T13:30:20 Some Name`\rThis would set an event named `Some Name` to start at February 8th, 2016 at 1:30:20 PM.");
						} else if (typeof eventInfo[0] === "object") {
							message.channel.sendMessage("You must delete the current event before creating a new one.");
						} else {
							message.channel.sendMessage("Error.");
							console.log("Something happened.");
						}
					} else if (results[1] === "del" && message.member.roles.exists("name", modrolename)) {
						console.log(colors.red("Attempting to remove event from the database."));
						connection.query("DELETE FROM advent WHERE server_id=" + message.guild.id, function(error) {
							if (error) {
								message.channel.sendMessage("Failed.");
								console.log(error);
								return;
							} else {
								console.log(colors.red("Successfully removed event."));
								message.channel.sendMessage("Event removed.");
							}
						});
					} else if (typeof eventInfo[0] === "object" && typeof results[1] !== "string") {
						var forSS = {
							"bool": false,
							"eventDate": eventInfo[0].time,
							"eventName": eventInfo[0].name
						};
						var startMessage = eventInfo[0].name + " will begin in ";
						var currentstream = timers.getCount(false, startMessage, forSS);
						message.channel.sendMessage(currentstream + "");
					} else if (typeof eventInfo[0] === "object") {
						message.channel.sendMessage("There is already an event sent. Use `" + prefix + "advent` to view it.");
					} else {
						console.log("Something happened.");
					}
					hardCode[ref].timeout();
				}
			});
		}
	}).catch((error) => console.error(error));
};

var speedy = function(message, results, connection) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			var forSS = {
				"bool": true
			};
			currentss = timers.getCount(false, "The next SS will begin in ", forSS);
			message.author.sendMessage("Speedy Saturday is a community multiplayer get-together event that occurs every week (on Saturday) at 6:00PM UTC until 8:00PM UTC (2 hour duration). More information can be found here:\rhttp://steamcommunity.com/app/233610/discussions/0/528398719786414266/\rhttps://redd.it/3mlfje\r" + currentss);
			hardCode[ref].timeout();
		}
	}).catch((error) => console.error(error));
};

var help = function(message, results, connection) {
	var quotespm;
	var quotespm2;
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			connection.query("SELECT commandname FROM commands WHERE server_id=" + message.guild.id + " order by commandname asc", function(error, quotes) {
				if (error) {
					message.channel.sendMessage("Failed to find any, with errors.");
					console.log(error);
					return;
				} else {
					if (typeof quotes[0] !== "object") {
						quotespm = "";
					}
					if (typeof quotes[0] === "object") {
						console.log(colors.red("Success."));
						quotespm = "`" + prefix;
						i = 0;
						for (i; i < quotes.length; i++) {
							if (i === quotes.length - 1) {
								quotespm += quotes[i].commandname + "`";
							} else {
								quotespm += quotes[i].commandname + "`, `" + prefix;
							}
						}
						connection.query("SELECT comname FROM servcom WHERE server_id=" + message.guild.id, function(error, quotes2) {
							if (error) {
								message.channel.sendMessage("Failed to find any, with errors.");
								console.log(error);
								return;
							} else {
								if (typeof quotes2[0] !== "object") {
									quotespm2 = "";
								} else {
									console.log(colors.red("Success."));
									quotespm2 = "`" + prefix;
									i = 0;
									for (i; i < quotes2.length; i++) {
										if (!(i === quotes2.length - 1)) {
											quotespm2 += quotes2[i].comname + "`, `" + prefix;
										} else {
											quotespm2 += quotes2[i].comname + "`";
										}
									}
									if (quotespm === "") {
										if (quotespm2) {
											message.author.sendMessage("No commands found for this server.");
										} else {
											message.author.sendMessage("Here are the main commands enabled for this server:\n" + quotespm);
										}
									} else if (quotespm2 === "") {
										message.author.sendMessage("Here are the custom commands for this server:\n" + quotespm2);
									} else {
										message.author.sendMessage("Here are the main commands enabled for this server:\n" + quotespm + "\n\nHere are the custom commands for this server:\n" + quotespm2);
									}
								}
							}
						});
					}
				}
			});
			hardCode[ref].timeout();
		}
	}).catch((error) => console.error(error));
};

var role = function(bot, message, results, connection) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			sdr.setDelRole(bot, message, modrolename, membrolename, prefix);
			hardCode[ref].timeout();
		}
	}).catch((error) => console.error(error));
};

var ripwin = function(message, results, connection) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			var riporwin = results[0].replace(prefix, "");
			rw.ripWin(message, prefix, modrolename, connection, riporwin);
			hardCode[ref].timeout();
		}
	}).catch((error) => console.error(error));
};

var uptime = function(message, results, connection) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			var uptime = process.uptime();
			message.channel.sendMessage(cl.formatUptime(uptime));
			hardCode[ref].timeout();
		}
	}).catch((error) => console.error(error));
};

var checkrole = function(message, results, connection, bot) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			let newMember = message.guild.members.get(message.author.id);
			let guild = newMember.guild;
			if (guild.id === "83078957620002816") {
				let botMember = guild.members.get(bot.user.id);
				if (botMember.hasPermission(10000000) && botMember.highestRole.position > newMember.highestRole.position) {
					let memberName = cl.getDisplayName(newMember);
					let playRole = guild.roles.find("name", "Playing Distance");
					if (!playRole) {
						return;
					}

					if (newMember.user.presence.game && newMember.user.presence.game.name === "Distance") {
						newMember.addRole(playRole).then(console.log(colors.white.dim("* " + memberName + " added to " + playRole.name + " role on " + guild.name + " server."))).catch(console.error);
					} else if (!newMember.user.presence.game && newMember.roles.has(playRole.id)) {
						newMember.removeRole(playRole).then(console.log(colors.white.dim("* " + memberName + " removed from " + playRole.name + " role on " + guild.name + " server."))).catch(console.error);
					} else if ((newMember.user.presence.game && newMember.user.presence.game !== "Distance") && newMember.roles.has(playRole.id)) {
						newMember.removeRole(playRole).then(console.log(colors.white.dim("* " + memberName + " removed from " + playRole.name + " role on " + guild.name + " server."))).catch(console.error);
					}
				}
			}
			hardCode[ref].timeout();
		}
	}).catch((error) => console.error(error));
};

function clean(text) {
	if (typeof text === "string") {
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	} else {
		return text;
	}
}

var evalu = function(message, bot) {
	if (message.author.id !== botowner) {
		return;
	} else {
		try {
			let args = message.content.split(" ").slice(1);
			var code = args.join(" ");
			var evaled = eval(code);

			if (typeof evaled !== "string") {
				evaled = require("util").inspect(evaled);
			}
			message.channel.sendCode("xl", clean(evaled));
		} catch (err) {
			message.channel.sendMessage(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
		}
	}
};

var test = function(message, results, connection) {
	ref = cl.getComRef(hardCode, results);
	hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
		if (response && !hardCode[ref].onCooldown) {
			var tweetid = testtweet.id_str;
			var tweetuser = testtweet.user.screen_name;
			var emoji = message.guild.emojis.find("name", "torcht");
			var intent = "https://twitter.com/intent";
			var profilelink = `https://twitter.com/${tweetuser}`;
			var tweetlink = `${profilelink}/status/${tweetid}`;
			var text = "";
			var medialink = "";
			var videolink = "";
			if (testtweet.entities.media) {
				medialink = testtweet.entities.media[0].media_url;
			}
			if (testtweet.extended_entities) {
				if (testtweet.extended_entities.media) {
					medialink = testtweet.extended_entities.media[0].media_url;
					if (testtweet.extended_entities.media[0].type === "video") {
						i = 0;
						for (i; i < testtweet.extended_entities.media[0].video_info.variants.length; i++) {
							if (testtweet.extended_entities.media[0].video_info.variants[i].content_type === "video/mp4") {
								videolink = testtweet.extended_entities.media[0].video_info.variants[i].url;
								medialink = "";
							}
						}
					}
				}
			}
			if (testtweet.extended_tweet) {
				if (testtweet.extended_tweet.full_text) {
					text = testtweet.extended_tweet.full_text.replace(/(https?:\/\/t.co\/[\w]+)$/, " ");
				}
			} else {
				text = testtweet.text.replace(/(https?:\/\/t.co\/[\w]+)$/, " ");
			}
			message.channel.sendMessage(`${emoji}`, {
				embed: {
					color: 3447003,
					author: {
						name: testtweet.user.name,
						url: profilelink,
						icon_url: testtweet.user.profile_image_url
					},
					//title: "This is an embed",
					url: tweetlink,
					description: `${text}\r\n\r\n**[View Tweet](${tweetlink})\r\n\r\n[Reply](${intent}/tweet?in_reply_to=${tweetid}) | [Retweet](${intent}/retweet?tweet_id=${tweetid}) | [Like](${intent}/like?tweet_id=${tweetid})**`,
					image: {
						url: medialink
					},
					video: {
						url: videolink
					},
					// provider: {
					// 	name: "Twitter",
					// 	url: "http://twitter.com"
					// },
					// fields: [{
					// 	name: "y",
					// 	value: "[View Tweet](" + tweetlink + ")"
					// }],
					timestamp: new Date(testtweet.created_at),
					footer: {
						//icon_url: testtweet.user.profile_image_url,
						text: `@${testtweet.user.screen_name}`
					}
				}
			}).catch((error) => console.error(error));
			//console.log("test");
		}
	}).catch((error) => console.error(error));
};

module.exports = {
	enable,
	disable,
	newcom,
	editcom,
	delcom,
	test,
	dist,
	wr,
	ss,
	advent,
	speedy,
	help,
	role,
	ripwin,
	checkrole,
	uptime,
	evalu
};
