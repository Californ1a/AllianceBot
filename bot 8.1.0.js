var Discord = require("discord.js"); //requirements
var mysql = require('mysql'); //requirements
//var fs = require('fs'); //requirements
var colors = require('colors'); //requirements
var jsondata = require('./config/options.json'); //local options
var token = require('./config/logins/discordtoken.json').token;
var http = require('http'); //requirements
var fs = require('fs-extra'); //requirements
var parseString = require('xml2js').parseString; //requirements
var Twit = require('twit'); //requirements
// var SteamUser = require('steam-user');
// var ok = new SteamUser();
var moment = require('moment');
var twitconfig = require('./config/logins/twitconfig.js'); //local js
var sqlconfig = require('./config/logins/sqlconfig.js'); //local js
var T = new Twit(twitconfig); //new twitter object
var RipWin = require('./modules/RipWin.js'); //local js
var setdelrole = require ('./modules/setdelrole.js') //local js
var checkMapID = require('./modules/checkmapid.js') //local js
var RipWinInstance = new RipWin(); //new object for ripwin
var setDelRoleInstance = new setdelrole(); //new object for setdelrole
var checkMapIDInstance = new checkMapID(); //new object for checkMapID
var bot = new Discord.Client(); //create bot
var prefix = jsondata.prefix;
var modrolename = jsondata.modrolename;
var membrolename = jsondata.membrolename;
var botowner = jsondata.botownerid;
var currentss = 0;
var ripwin = null;
var chatlinedata = "";
var ampm = "AM";
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
var commandname = "";
var hardcommands = [{comName:"tf", onCooldown:"false"}, {comName:"newcom", onCooldown:"false"}, {comName:"delcom", onCooldown:"false"}, {comName:"dist", onCooldown:"false"}, {comName:"wr", onCooldown:"false"}, {comName:"ss", onCooldown:"false"}, {comName:"speedy", onCooldown:"false"}, {comName:"cmds", onCooldown:"false"}, {comName:"commands", onCooldown:"false"}, {comName:"help", onCooldown:"false"}, {comName:"setrole", onCooldown:"false"}, {comName:"delrole", onCooldown:"false"}, {comName:"win", onCooldown:"false"}, {comName:"rip", onCooldown:"false"}, {comName:"test", onCooldown:"false"}, {comName:"advent", onCooldown:"false"}];
var isit = false;
var cooldown = false;
var stream = T.stream('statuses/filter', { follow: ['628034104', '241371699']}); //create tweet filter, first two are refract and torcht, rest for testing
var tweetcount = 0;
var eventDate = null;
var eventName = null;

//on new tweet matching filter
stream.on('tweet', function (tweet) {
	var tweetid = tweet.id_str;
	var tweetuser = tweet.user.screen_name;
	console.log(colors.red("Found matching tweet: https://twitter.com/" + tweetuser + "/status/" + tweetid)); //console link to tweet
	//if ((tweet.in_reply_to_user_id == null || tweet.in_reply_to_user_id == tweet.user.id) && tweet.retweeted == false && !tweet.text.startsWith("RT @") && !tweet.text.startsWith("@") && (tweet.user.screen_name == "torcht" || tweet.user.screen_name == "refractstudios") && tweet.is_quote_status == false) {
	if ((tweet.in_reply_to_user_id == null || tweet.in_reply_to_user_id == tweet.user.id) && !tweet.text.startsWith("RT @") && !tweet.text.startsWith("@") && (tweet.user.screen_name == "torcht" || tweet.user.screen_name == "refractstudios")) {
		var tweetjson = JSON.stringify(tweet,null,2);
		if (tweetcount < 4) {
			tweetcount += 1;
			fs.appendFile("tweet.json", tweetjson + "\r\n\r\n\r\n\r\n\r\n");
		}
		else {
			fs.writeFile("tweet.json", tweetjson + "\r\n\r\n\r\n\r\n\r\n");
			tweetcount = 0;
		}
		var mediaurl = "";
		var vine = "";
		if (tweet.entities.media) {
			mediaurl = "\r" + tweet.entities.media[0].media_url;
		}
		if (tweet.entities.urls != null && tweet.entities.urls != "") {
			if (tweet.entities.urls[0].display_url.startsWith("vine.")) {
				vine = "\r" + tweet.entities.urls[0].expanded_url;
			}
		}
		bot.sendMessage("83078957620002816", "https://twitter.com/" + tweetuser + "/status/" + tweetid + mediaurl + vine); //channelid, write message with link to tweet
		//bot.sendMessage("211599888222257152", "https://twitter.com/" + tweetuser + "/status/" + tweetid); //my test server
	}
});





//connect to mysql server
var connection = mysql.createConnection(sqlconfig);
connection.connect();

//log to console when ready
bot.on("ready", function() {
	console.log(colors.red("Bot online and ready on " + bot.servers.length + " server(s)."));
	bot.setStatus("online", "Distance", function (error) {
		if (error) {
			console.log(error);
		}
	});
});

//handle disconnect
bot.on("disconnected", function() {
	console.log(bot.servers);
	console.log(colors.red("Bot disconnected from server."));
});

//add new servers to mysql database when bot added to new server
bot.on("serverCreated", function(server) {
	console.log(colors.red("Trying to insert server '" + server.name + "' into database."));
	var info = {
		"servername": "'" + server.name + "'",
		"serverid": server.id,
		"ownerid": server.owner.id,
		"prefix": "!"
	}
	connection.query("INSERT INTO servers SET ?", info, function(error) {
		if (error) {
			console.log(error);
			return;
		}
		else {
			console.log(colors.red("Successfully inserted server."));
		}
	});
	// console.log(colors.red("Trying to copy commands to new server."));
	// connection.query("INSERT INTO commands (commandname, server_id) SELECT DISTINCT(commandname), " + server.id + " FROM commands WHERE server_id=211599888222257152", function(error) {
	// 	if (error) {
	// 		console.log(error);
	// 		return;
	// 	}
	// 	else {
	// 		console.log(colors.red("Successfully copied commands."));
	// 	}
	// });
});

//remove server from mysql database when bot kicked
bot.on("serverDeleted", function(server) {
	console.log(colors.red("Attempting to remove " + server.name + " from the database."));
	connection.query("DELETE FROM servers WHERE serverid = '" + server.id + "'", function(error) {
		if (error) {
			console.log(error);
			return;
		}
		console.log(colors.red("Successfully removed server."));
	});
});


//--------------------------Begin bot commands--------------------------
bot.on("message", function(message) {
var chatlog = "E:/OtherStuff/DiscordChatlogs/";
	if (!message.channel.isPrivate) { //non-pm messages
		var d = new Date();
		var hournow = d.getHours();
		ampm = "AM";
		if (hournow == 0) {
			hournow = 12
			ampm = "AM";
		}
		else if (hournow >= 13) {
			hournow = hournow - 12;
			ampm = "PM";
		}
		if (hournow < 10 && hournow > 0) {
			hournow = "0" + hournow;
		}
		var minutenow = d.getMinutes();
		if (minutenow < 10) {
			minutenow = "0" + minutenow;
		}
		var secondnow = d.getSeconds();
		if (secondnow < 10) {
			secondnow = "0" + secondnow;
		}
		var day = d.getDate();
		var monthIndex = d.getMonth();
		var year = d.getFullYear();
		var thedate = monthNames[monthIndex] + " " + day + ", " + year + " " + hournow + ":" + minutenow + ":" + secondnow;
		var userrole = message.server.detailsOfUser(message.author.id);
		if (userrole.roles.length == 0) {
			userrole = "Guest";
			if (message.author.bot) {
				isbot = "{BOT}"
			}
			else {
				isbot = "";
			}
		}
		else {

			// console.log(userrole + "\n");
			// console.log(userrole.roles + "\n");
			// console.log(userrole.roles.length + "\n");
			// console.log(message.server.roles.get("position", userrole.roles.length + "\n"));
			//console.log(userrole.roles[0]);
			var maxpos = 0;
			for (var i = 0; i < userrole.roles.length; i++) {
				if (userrole.roles[i].position > maxpos) {
					maxpos = userrole.roles[i].position;
				}
			}
			var toprole = message.server.roles.get("position", maxpos);
			// if ((message.server.id == 113151199963783168 && userrole.roles.length == 1) || message.server.id == 211599888222257152) {
			// 	toprole = message.server.roles.get("position", userrole.roles.length+1);
			// }
			userrole = toprole.name;
			if (message.author.bot) {
				isbot = "{BOT}"
			}
			else {
				isbot = "";
			}
		}
		// if (!fs.existsSync('./chatlogs/' + message.server.name)) {
		// 	fs.mkdirSync('./chatlogs/' + message.server.name)
		// }
		fs.mkdirs(chatlog + message.server.name + "/" + message.channel.name + "/" + year, function(error) {
			if (error) {
				console.log(error);
				return;
			}
		});
		// console.log(message.attachments.length);
		// console.log(message.embeds.length);
		if (message.attachments.length > 0) {
			chatlog = chatlog + message.server.name + "/" + message.channel.name + "/" + year + "/" + monthNames[monthIndex] + ".txt";
			if (message.server.detailsOfUser(message.author).nick) {
				chatlinedata = thedate + ampm + " | " + isbot + "(" + userrole + ")" + message.server.detailsOfUser(message.author).nick + ": " + message.cleanContent + "\r\n" + message.attachments[0].url + "\r\n";
			}
			else {
				chatlinedata = thedate + ampm + " | " + isbot + "(" + userrole + ")" + message.author.name + ": " + message.cleanContent + "\r\n" + message.attachments[0].url + "\r\n";
			}
			fs.appendFile(chatlog, chatlinedata, function(error) {
				if (error) {
					console.log(error);
				}
				else {
					if (message.server.detailsOfUser(message.author).nick) {
						console.log(colors.white(hournow + ":" + minutenow + ampm + " [" + message.server.name + "/#" + message.channel.name + "] " + isbot + "(" + userrole + ")" + message.server.detailsOfUser(message.author).nick + ": " + message.cleanContent));
					}
					else {
						console.log(colors.white(hournow + ":" + minutenow + ampm + " [" + message.server.name + "/#" + message.channel.name + "] " + isbot + "(" + userrole + ")" + message.author.name + ": " + message.cleanContent));
					}
					console.log(colors.white(message.attachments[0].url));
				}
			});
		}
		else {
			chatlog = chatlog + message.server.name + "/" + message.channel.name + "/" + year + "/" + monthNames[monthIndex] + ".txt";
			if (message.server.detailsOfUser(message.author).nick) {
				chatlinedata = thedate + ampm + " | " + isbot + "(" + userrole + ")" + message.server.detailsOfUser(message.author).nick + ": " + message.cleanContent + "\r\n";
			}
			else {
				chatlinedata = thedate + ampm + " | " + isbot + "(" + userrole + ")" + message.author.name + ": " + message.cleanContent + "\r\n";
			}

			//var userjson = JSON.stringify(message.server.detailsOfUser(message.author));
			// if (message.server.detailsOfUser(message.author).nick) {
			// 	fs.appendFile("userjson.json", message.server.detailsOfUser(message.author).nick + "\r\n\r\n\r\n\r\n\r\n");
			// }

			fs.appendFile(chatlog, chatlinedata, function(error) {
				if (error) {
					console.log(error);
				}
				else {
					if (message.server.detailsOfUser(message.author).nick) {
						console.log(colors.white(hournow + ":" + minutenow + ampm + " [" + message.server.name + "/#" + message.channel.name + "] " + isbot + "(" + userrole + ")" + message.server.detailsOfUser(message.author).nick + ": " + message.cleanContent));
					}
					else {
						console.log(colors.white(hournow + ":" + minutenow + ampm + " [" + message.server.name + "/#" + message.channel.name + "] " + isbot + "(" + userrole + ")" + message.author.name + ": " + message.cleanContent));
					}
				}
			});
		}



		//add new members to member role
		if (!bot.memberHasRole(message.author, message.server.roles.get("name", membrolename))) {
			//console.log(message.server.roles.get("name", modrolename));
			connection.query("SELECT commandname FROM commands WHERE server_id=" + message.server.id + " AND commandname='automemb'", function(error, enabledforserver) {
				if (error) {
					bot.sendMessage(message, "Failed.");
					console.log(error);
					return;
				}
				else {
					if (enabledforserver[0] == null) {
						console.log(colors.red("Automemb not enabled for this server."));
						//console.log(enabledforserver);
						//bot.sendMessage(message, "This command is not enabled for this server.");
					}
					else {
						var botcanassign = false;
						//var userrole = message.server.detailsOfUser(message.author.id);
						//console.log(userrole);
						//var toprole = message.server.roles.get("position", userrole.roles.length);
						if (userrole == "Guest") {
							console.log(colors.red("User is Guest."));
							toprole = 0;
						}
						else {
							console.log("User isn't guest?");
						}
						var userrole3 = message.server.detailsOfUser(bot.user);
						if (userrole3.roles.length == 0) {
							//bot is guest
							console.log(colors.red("Bot cannot assign (Bot is guest)."));
							botcanassign = false;
						}
						else {
							//get top role of the bot
							var maxpos2 = 0;
							for (var i = 0; i < userrole3.roles.length; i++) {
								if (userrole3.roles[i].position > maxpos2) {
									maxpos2 = userrole3.roles[i].position;
								}
							}
							var toprole3 = message.server.roles.get("position", maxpos2);

							//var toprole3 = message.server.roles.get("position", userrole3.roles.length);
							//console.log(toprole3.name);
							if (toprole3.hasPermission("manageRoles")) {
								botcanassign = true;
								//console.log(toprole3.position);
								//console.log(toprole2.position);
								if (toprole3.position <= toprole.position) {
									botcanassign = false;
								}
								else if (toprole3.position - 1 == toprole.position) {
									botcanassign = false;
								}
							}
							else {
								botcanassign = false;
							}
						}
						if (botcanassign) {
							bot.addMemberToRole(message.author, message.server.roles.get("name", membrolename));
							bot.reply(message, "Welcome to the discord! You are now a " + membrolename + ".");
						}
					}
				}
			});
		}



		var messagesent = false;


		//check for custom server command
		if (message.content.startsWith(prefix)) {
			var str = message.toString();
			results = str.split(' ');
			results[0] = results[0].replace(prefix, "");
			connection.query("SELECT comtext, modonly, inpm FROM servcom WHERE server_id=" + message.server.id + " AND comname='" + results[0] + "'", function(error, returntext) {
				if (error) {
					console.log(error);
					return;
				}
				else {
					if (!(returntext[0] == null)) {
						//var commessage = returntext[0];

						// console.log(returntext[0].comtext);
						// console.log(returntext2[0].modonly);
						// console.log(commessage);
						if (returntext[0].modonly == "true" && bot.memberHasRole(message.author, message.server.roles.get("name", modrolename))) {
							var str = returntext[0].comtext;
							results = str.slice(1,str.length-1);
							if (returntext[0].inpm == "true") {
								bot.sendMessage(message.author.id, results);
							}
							else if (returntext[0].inpm == "false") {
								bot.sendMessage(message, results);
							}
							messagesent = true;
						}
						else if (returntext[0].modonly == "false") {
							var str = returntext[0].comtext;
							results = str.slice(1,str.length-1);
							if (returntext[0].inpm == "true") {
								bot.sendMessage(message.author.id, results);
							}
							else if (returntext[0].inpm == "false") {
								bot.sendMessage(message, results);
							}
							messagesent = true;
						}
						else {
							bot.sendMessage(message, "This is a " + modrolename + "-only command.");
						}

						// connection.query("SELECT modonly FROM servcom WHERE server_id=" + message.server.id + " AND comname='" + results[0] + "'", function(error, returntext2) {
						// 	if (error) {
						// 		console.log(error);
						// 		return;
						// 	}
						// 	else {
						// 		if (returntext2[0] != null) {
						//
						// 		}
						// 	}
						// });
					}
				}
			});







			if(!messagesent) {
				if (message.content.startsWith(prefix + "addcomtoserv")) {
					if (message.author.id == botowner || message.server.owner.equals(message.author)) {
						var str = message.toString();
						results = str.split(' ');

						//console.log(results);
						//console.log(results.length);
						if (results.length <= 2) {
							if (results[1] == null) {
								bot.sendMessage(message, "To view the help for this command use `" + prefix + "addcomtoserv help`.");
							}
							else if (results[1] == "help") {
								bot.sendMessage(message, "Usage: `" + prefix + "addcometoserv <command name>`\nDo not include the prefix in the command name. This command is only available to the bot owner.");
							}
							else {
								var iscommand = false;
								for (var i = 0; i < hardcommands.length; i++) {
									if (hardcommands[i]["comName"] == results[1]) {
										iscommand = true;
									}
								}
								//console.log(iscommand);
								if (iscommand) {
									if (results[1].includes(prefix)) {
										bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "remcomfromserv help` to view the syntax help.");
									}
									else {
										//database
										console.log(colors.red("Trying to insert command '" + results[1] + "' into database."));
										var info = {
											"commandname": results[1],
											"server_id": message.server.id,
										}
										connection.query("INSERT INTO commands SET ?", info, function(error) {
											if (error) {
												console.log(error);
												bot.sendMessage(message, "Failed.");
												return;
											}
											else {
												console.log(colors.red("Successfully added command to server."));
												bot.sendMessage(message, "Successfully added command to server.");
											}
										});
									}
								}
								else {
									bot.sendMessage(message, "`" + results[1] + "` is not a recognized command.");
								}
							}
						}
						else {
							bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "addcomtoserv help` to view the syntax help.");
						}
					}
					// else {
					// 	bot.sendMessage(message, "This command is only available to the bot owner.");
					// }
				}

				else if (message.content.startsWith(prefix + "remcomfromserv")) {
					if (message.author.id == botowner || message.server.owner.equals(message.author)) {
						var str = message.toString();
						results = str.split(' ');
						//console.log(results);
						//console.log(results.length);
						if (results.length <= 2) {
							if (results[1] == null) {
								bot.sendMessage(message, "To view the help for this command use `" + prefix + "remcomfromserv help`.");
							}
							else if (results[1] == "help") {
								bot.sendMessage(message, "Usage: `" + prefix + "remcomefromserv <command name>`\nDo not include the prefix in the command name. This command is only available to the bot owner.");
							}
							else {
								if (results[1].includes(prefix)) {
									bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "remcomfromserv help` to view the syntax help.");
								}
								else {
									//database
									console.log(colors.red("Trying to remove command '" + results[1] + "' from database."));
									// var info = {
									// 	"commandname": results[1],
									// 	"server_id": message.server.id,
									// }
									connection.query("DELETE FROM commands WHERE commandname='" + results[1] + "' AND server_id=" + message.server.id, function(error) {
										if (error) {
											console.log(error);
											bot.sendMessage(message, "Failed.");
											return;
										}
										else {
											console.log(colors.red("Successfully removed command from server."));
											bot.sendMessage(message, "Successfully removed command from server.");
										}
									});
								}
							}
						}
						else {
							bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "remcomfromserv help` to view the syntax help.");
						}
					}
					// else {
					// 	bot.sendMessage(message, "This command is only available to the bot owner.");
					// }
				}


				else if (message.content.startsWith(prefix + "newcom")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {


							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[1]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								if (bot.memberHasRole(message.author, message.server.roles.get("name", modrolename))) {
									var str = message.content.toString();
									results = str.split(' ');
									if (results[1] == null) {
										bot.sendMessage(message, "Incorrect syntax1. Use `" + prefix + "newcom help` for help.");
									}
									else if (results[1] == "help") {
										bot.sendMessage(message, "Usage: `" + prefix + "newcom <command name> <mod-only(true|false)> <reply-in-pm(true|false)> <message>`\nDo not include the prefix on the command name. (Ex. `" + prefix + "newcom spook false false BOO! Scared ya!` The new command would be `" + prefix + "spook` (enabled for all members, not just " + modrolename + "s & would reply in-channel) and the returned message would be `BOO! Scared ya!`)");
									}
									else if (results[1].includes(prefix)) {
										bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "newcom help` for help.");
									}
									else if (results.length == 2) {
										bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "newcom help` for help.");
									}
									else if (results.length == 3) {
										bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "newcom help` for help.");
									}
									else if (results.length == 4) {
										bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "newcom help` for help.");
									}
									else if ((results[2] != "true") && (results[2] != "false")) {
										bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "newcom help` for help. " + results[2]);
									}
									else if ((results[3] != "true") && (results[3] != "false")) {
										bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "newcom help` for help. " + results[2]);
									}
									else {
										var recombined = "";
										//console.log(results.length);
										for (i = 0; i < results.length-4; i++) {
											if (i != results.length-5) {
												recombined += results[i+4] + " ";
											}
											else {
												recombined += results[i+4];
											}
										}
										//console.log(recombined);
										console.log(colors.red("Attempting to add the command `" + prefix + results[1] + "` with the resulting message `" + recombined + "` to server `" + message.server.name + "`."));
										var info = {
											"comname": results[1],
											"comtext": "'" + recombined + "'",
											"modonly": results[2],
											"inpm": results[3],
											"server_id": message.server.id
										}
										//bot.sendMessage(message, recombined + " - " + results[2]);


										connection.query("INSERT INTO servcom SET ?", info, function(error) {
											if (error) {
												console.log(error);
												bot.sendMessage(message, "Failed.");
												return;
											}
											else {
												console.log(colors.red("Successfully inserted command."));
												bot.sendMessage(message, "Success.");
											}
										});


									}
								}
								else {
									bot.reply(message, "Only " + modrolename + "s can add commands.");
								}
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 5000);
							}
						}
					});
				}



				else if (message.content.startsWith(prefix + "delcom")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {


							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[1]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								if (bot.memberHasRole(message.author, message.server.roles.get("name", modrolename))) {
									var str = message.content.toString();
									results = str.split(' ');
									if (results[1] == null) {
										bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "newcom help` for help.");
									}
									else if (results[1] == "help") {
										bot.sendMessage(message, "Usage: `" + prefix + "delcom <command name>`\nDo not include the prefix on the command name. (Ex. `" + prefix + "delcom spook` will remove the `" + prefix + "spook` command.)");
									}
									else if (results[1].includes(prefix)) {
										bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "newcom help` for help.");
									}
									else if (results.length >= 3) {
										bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "newcom help` for help.");
									}
									else {
										//console.log(recombined);
										console.log(colors.red("Attempting to remove the command `" + prefix + results[1] + "` from server `" + message.server.name + "`."));
										// var info = {
										// 	"comname": results[1],
										// 	"comtext": "'" + recombined + "'",
										// 	"server_id": message.server.id
										// }
										connection.query("DELETE FROM servcom WHERE comname='" + results[1] + "' AND server_id=" + message.server.id, function(error) {
											if (error) {
												console.log(error);
												bot.sendMessage(message, "Failed.");
												return;
											}
											else {
												console.log(colors.red("Successfully removed command."));
												bot.sendMessage(message, "Success.");
											}
										});
									}
								}
								else {
									bot.reply(message, "Only " + modrolename + "s can delete commands.");
								}
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 5000);
							}
						}
					});
				}



				//test

				else if (message.content.startsWith(prefix + "test")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {

							// var apps = ["233610"];
							// var packages = ["50612"];
							// ok.getProductInfo(apps, packages, function (appscb, packagescb, unknownAppscb, unknownPackagescb) {
							// 	console.log(appscb + "/r/n");
							// 	console.log(packagescb + "/r/n");
							// 	console.log(unknownAppscb + "/r/n");
							// 	console.log(unknownPackagescb + "/r/n");
							// });

						}
					});
				}



				else if (message.content.startsWith(prefix + "dist")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {


							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[1]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								//var gamename = results[1];
								var mapid = null;
								var str = message.content.toString();
								results = str.split(' ');
								//console.log(results[2]);
								//console.log(jsondata.officialmapids['Speed and Style']['Broken Symmetry']);


								if (results[1] == null || results[1] == "") {
									bot.sendMessage(message, "Incorrect syntax. Use `" + prefix + "dist help` for syntax help.");
								}
								else if (results[1] == "help") {
									bot.sendMessage(message, "Usage: `" + prefix + "dist <map name> <category>`\nOnly official maps are supported, and only Sprint, Speed and Style, and Challenge modes (no Stunt currently). The category is only necessary when requesting a Sprint or Speed and Style map (because they have the same map name). The category will be ignored if a Challenge-mode map name is given. Abbreviations for map names and modes are accepted but not required (Ex. both `" + prefix + "dist bs s` and `" + prefix + "dist broken symmetry sprint` would return the best time for broken symmetry in sprint mode).")
								}
								else {
									//broken symmetry
									mapid = checkMapIDInstance.checkMapID(message, colors, results, jsondata, mapid);





									if (mapid == 0) {
										bot.sendMessage(message, "Incorrect syntax.")
									}
									else if (mapid != null && mapid != "") {
										var optionsac = {
											hostname: 'steamcommunity.com',
											path: '/stats/233610/leaderboards/' + mapid + '/?xml=1&start=1&end=1',
											method: 'GET',
										};
										http.request(optionsac, function(response) {
											var str = '';
											//str.setEncoding('utf-8');
											response.on('data', function (chunk) {
												str += chunk;
											});
											response.on('end', function() {
												parseString(str, function(error, result) {
													if (error) {
														console.log(error);
													}
													else {
														var sometest = result.response.entries[0].entry[0].score;
														var somesteamid = result.response.entries[0].entry[0].steamid.toString();
														//var table = JSON.parse(str);
														//console.log(parseInt(sometest.toString(), 10));
														var working = parseInt(sometest.toString(), 10)
														var wrmin = ((working/1000)/60) >> 0;
														var wrsec = (working/1000)-(wrmin*60) >> 0;
														var wrmil = (working/1000).toFixed(3).split('.');
														wrmil = wrmil[1];
														// console.log(wrmin);
														// console.log(wrsec);
														// console.log(wrmil);
														// if (wrmin < 10) {
														// 	wrmin = "0" + wrmin;
														// }
														if (wrsec < 10) {
															wrsec = "0" + wrsec;
														}
														//begin convert steamid64 to profile name
														var optionsac2 = {
															hostname: 'steamcommunity.com',
															path: '/profiles/' + somesteamid + "/?xml=1",
															method: 'GET',
														};
														http.request(optionsac2, function(response) {
															var str2 = '';
															//str.setEncoding('utf-8');
															response.on('data', function (chunk) {
																str2 += chunk;
															});
															response.on('end', function() {
																parseString(str2, function(error, result2) {
																	if (error) {
																		console.log(error);
																	}
																	else {
																		//console.log(somesteamid);
																		//console.log(result2);
																		//console.log(result2.profile.steamID);
																		var profilename = result2.profile.steamID.toString();
																		bot.sendMessage(message, wrmin + ":" + wrsec + "." + wrmil + " by " + profilename);
																	}
																});
															})
														}).end();
													}
												});
											})
										}).end();
									}
									else {
										bot.sendMessage(message, "No data found.")
									}
									hardcommands[ref]["onCooldown"] = "true";
									setTimeout(function() {
										hardcommands[ref]["onCooldown"] = "false";
									}, 5000);
								}
							}
						}
					});
				}



				else if (message.content.startsWith(prefix + "wr")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {


							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[1]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								if (results[1] != null) {

									var str2 = message.content.toString();
									str2 = str2.substr(str2.indexOf(" ") + 1);
									str2 = str2.toLowerCase().split(' ');

									for (var i = 0; i < str2.length; i++) {
										str2[i] = str2[i].split('');
										str2[i][0] = str2[i][0].toUpperCase();
										str2[i] = str2[i].join('');
									}
									firstLetterCaps = str2.join(' ');
									//console.log(message.server.name);



									var category = firstLetterCaps;
									if (message.server.name == "Cali Test Server") {
										var gamename = "Antichamber";
									}
									else {
										var gamename = message.server.name;
									}
									var nonefound = true;
									var optionsac = {
										hostname: 'www.speedrun.com',
										path: '/api_records.php?game=' + gamename,
										method: 'GET',
										json:true
									};
									http.request(optionsac, function(response) {
										var str = '';
										//str.setEncoding('utf-8');
										response.on('data', function (chunk) {
											str += chunk;
										});
										response.on('end', function() {
											var actable = JSON.parse(str)[gamename];
											for (var key in actable) {
												if (actable.hasOwnProperty(key)) {
													if (key.indexOf(category) > -1) {
														if (nonefound) {


															var sometime = actable[key].time;
															var working = parseFloat(sometime.toString())
															var wrmin = (working/60) >> 0;
															var wrsec = working-(wrmin*60) >> 0;
															var wrmil = working.toFixed(2).split('.');
															wrmil = wrmil[1];
															if (wrsec < 10) {
																wrsec = "0" + wrsec;
															}


															if (actable[key].video == null || actable[key].video == "") {
																bot.sendMessage(message, wrmin + ":" + wrsec + "." + wrmil + " by " + actable[key].player + ": No video found.");
																nonefound = false;
															}
															else {
																bot.sendMessage(message, wrmin + ":" + wrsec + "." + wrmil + " by " + actable[key].player + ": " + actable[key].video);
																nonefound = false;
															}
														}
													}
												}
											}
											if (nonefound) {
												bot.sendMessage(message, "No record found for the given category.");
												nonefound = true;
											}
											//console.log(actable[category].time + " by " + actable[category].player);
										})
									}).end();
								}
								else {
									bot.sendMessage(message, "Incorrect syntax, category name required.")
								}
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 5000);
							}
						}
					});
				}


				else if (message.content.startsWith(prefix + "ss")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {


							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[0]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								currentss = GetCount(message);
								//console.log(currentss);
								bot.sendMessage(message, currentss + " Use !speedy for full SS information.");
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 5000);
							}
						}
					});
				}


				else if (message.content.startsWith(prefix + "advent")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {


							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[0]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {


								if (results[1] == "set" && bot.memberHasRole(message.author, message.server.roles.get("name", modrolename))) {
									console.log(results[2]);
									if (results[2] != null && results[2] != "") {
										eventName = null;
										eventDate = results[2];
										if (results[3] != null && results[3] != "") {
											for (var i = 0; i < results.length; i++) {
												if (i == 3) {
													eventName = results[i];
												}
												else if (i > 3) {
													eventName = eventName + " " + results[i];
												}
											}
										}
										bot.sendMessage(message, "Event date set to: " + eventDate + "\nEvent name set to: " + eventName);
									}
									else {
										bot.sendMessage(message, "Set an event date: `" + prefix + "advent set <date(ISO8601 format, no spaces use T to denote time)> <event name>` (Ex. `" + prefix + "advent set 2016-02-08T13:30:20 Some Name` would set an event named \"Some Name\" to start at February 8th, 2016 at 1:30:20 PM, times are in Eastern time.)");
									}
								}
								else if (results[1] == "del" && bot.memberHasRole(message.author, message.server.roles.get("name", modrolename))) {
									if (eventDate != null && eventDate != "") {
										eventDate = null;
										bot.sendMessage(message, "Event removed.");
									}
									else {
										bot.sendMessage(message, "No event set.");
									}
								}
								else if ((results[1] == null || results[1] == "") && (eventDate != null && eventDate != "")) {
									currentstream = GetCountEvent(message, eventDate, eventName);
									bot.sendMessage(message, currentstream + "");
								}
								else {
									bot.sendMessage(message, "No event set.")
								}
								//console.log(currentss);
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 2000);
							}
						}
					});
				}




				else if (message.content.startsWith(prefix + "speedy")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {


							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[1]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								currentss = GetCount(message);
								bot.sendMessage(message.author.id, "Speedy Saturday is a community multiplayer get-together event that occurs every week (on Saturday) at 6:00PM UTC until 8:00PM UTC (2 hour duration). More information can be found here:\nhttp://steamcommunity.com/app/233610/discussions/0/528398719786414266/\nhttps://redd.it/3mlfje\n" + currentss);
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 1000);
							}
						}
					});
				}



				// else if (message.content.startsWith(prefix + "faq")) {
				// 	isEnabledForServer(message, connection, bot, function(someresult) {
				// 		if (someresult) {
				// 			bot.sendMessage(message, "https://www.reddit.com/r/distance/wiki/faq");
				// 		}
				// 	});
				// }


				// if (message.content.startsWith(prefix + "pm")) {
				// 	bot.sendMessage(message.author.id, "test");
				// }
				else if (message.content.startsWith(prefix + "commands") || message.content.startsWith(prefix + "cmds") || message.content.startsWith(prefix + "help")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {


							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[1]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								connection.query("SELECT commandname FROM commands WHERE server_id=" + message.server.id, function(error, quotes) {
									if (error) {
										bot.sendMessage("Failed to find any, with errors.");
										console.log(error);
										return;
									}
									else {
										if (quotes[0] == null) {
											// console.log(colors.red("Failed."));
											// bot.sendMessage(message.author.id, "Failed to find any commands for your server.");
											var quotespm = "";
										}
										else {
											console.log(colors.red("Success."));
											var quotespm = "`" + prefix;
											for (i = 0; i < quotes.length; i++) {
												if (i == quotes.length-1) {
													quotespm += quotes[i].commandname + "`";
												}
												else {
													quotespm += quotes[i].commandname + "`, `" + prefix;
												}
											}


											connection.query("SELECT comname FROM servcom WHERE server_id=" + message.server.id, function(error, quotes2) {
												if (error) {
													bot.sendMessage("Failed to find any, with errors.");
													console.log(error);
													return;
												}
												else {
													if (quotes2[0] == null) {
														// console.log(colors.red("Failed."));
														// bot.sendMessage(message, "Failed to find any custom commands for your server.");
														var quotespm2 = "";
													}
													else {
														console.log(colors.red("Success."));
														var quotespm2 = "`" + prefix;
														for (i = 0; i < quotes2.length; i++) {
															if (!(i == quotes2.length-1)) {
																quotespm2 += quotes2[i].comname + "`, `" + prefix;
															}
															else {
																quotespm2 += quotes2[i].comname + "`";
															}
														}
														if (quotespm == "") {
															if (quotespm2) {
																bot.sendMessage(message.author.id, "No commands found for this server.");
															}
															else {
																bot.sendMessage(message.author.id, "Here are the main commands enabled for this server:\n" + quotespm);
															}
														}
														else if (quotespm2 == "") {
															bot.sendMessage(message.author.id, "Here are the custom commands for this server:\n" + quotespm2);
														}
														else {
															bot.sendMessage(message.author.id, "Here are the main commands enabled for this server:\n" + quotespm + "\n\nHere are the custom commands for this server:\n" + quotespm2);
														}
													}
												}
											});



										}
									}
								});
								//bot.sendMessage(message.author.id, "Prefix: " + prefix + "\nAvailable to all: ss, speedy, faq, rip, win\nAvailable exclusively to " + modrolename + "s: setrole, rip add, rip del, win add, win del");
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 5000);
							}
						}
					});
				}




				//setdelrole
				else if (message.content.startsWith(prefix + "setrole")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {


							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[1]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								setDelRoleInstance.setRole(message, modrolename, membrolename, prefix, bot, toprole);
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 5000);
							}
						}
					});
				}
				else if (message.content.startsWith(prefix + "delrole")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {


							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[1]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								setDelRoleInstance.delRole(message, modrolename, membrolename, prefix, bot, toprole);
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 5000);
							}
						}
					});
				}
				//end setdelrole







				//ripwin command
				else if (message.content.startsWith(prefix + "win")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {


							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[1]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								ripwin = "win";
								RipWinInstance.ripWin(message, prefix, modrolename, colors, connection, bot, ripwin);
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 100);
							}
						}
					});
				}
				else if (message.content.startsWith(prefix + "rip")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {



							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[1]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								ripwin = "rip";
								RipWinInstance.ripWin(message, prefix, modrolename, colors, connection, bot, ripwin);
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 100);
							}
						}
					});
				}
				else if (message.content.startsWith(prefix + "tf")) {
					isEnabledForServer(message, connection, bot, function(someresult) {
						if (someresult) {



							var ref = 0;
							for (var i = 0; i < hardcommands.length; i++) {
								if (hardcommands[i]["comName"] == results[1]) {
									ref = i;
								}
							}
							if (hardcommands[ref]["onCooldown"] == "false") {




								ripwin = "tf";
								RipWinInstance.ripWin(message, prefix, modrolename, colors, connection, bot, ripwin);
								hardcommands[ref]["onCooldown"] = "true";
								setTimeout(function() {
									hardcommands[ref]["onCooldown"] = "false";
								}, 100);
							}
						}
					});
				}
				//end ripwin
			}
		}

		//-----------------------------------------------

		// if (message.content.startsWith(prefix + "guest") && bot.memberHasRole(message.author, message.server.roles.get("name", membrolename))) {
		// 	bot.removeMemberFromRole(message.author, message.server.roles.get("name", membrolename));
		// 	bot.reply(message, "You are now a guest.");
		// }
	}

	else { //pm messages
		console.log(colors.grey("(Private) " + message.author.name + ": " + message.cleanContent));
		// if (message.content.startsWith(prefix + "commands") || message.content.startsWith(prefix + "cmds")) {
		// 	bot.sendMessage(message.author.id, "\n**Prefix:** `" + prefix + "`\n**Available to all:** `cmds, commands, ss, speedy, faq, rip, win`\n**Exclusive to " + modrolename + ":** `setrole, rip add, rip del, win add, win del`");
		// }
		if (message.content.startsWith(prefix)) {
			bot.sendMessage(message.author.id, "Using commands via PM is not supported as I have no indication of which server you want to access the commands for. Please use the command from within the server - To view which commands are enabled for your server, use `" + prefix + "cmds` within that server.");
		}
	}
});


//catch errors
bot.on('error', e => { console.error(e); });
bot.on('warn', e => { console.warn(e); });
bot.on('debug', e => { console.info(e); });





//discord login
bot.loginWithToken(token, function (error, token) {
	if (error) {
		console.log(error);
		return;
	}
	else {
		console.log(colors.red("Logged in."));
	}
});



//try to make commands per-server
function isEnabledForServer(message, connection, bot, cb) {
	var str = message.content.toString();
	var results = null;
	results = str.split(' ');
	if (results[0].includes(prefix)) {
		results[0] = results[0].replace(prefix, "");
	}
	commandname = results[0]
	connection.query("SELECT commandname FROM commands WHERE server_id=" + message.server.id + " AND commandname='" + commandname + "'", function(error, enabledforserver) {
		if (error) {
			bot.sendMessage(message, "Failed.");
			console.log(error);
			return;
		}
		else {
			if (enabledforserver[0] == null) {
				console.log(colors.red("Command not enabled for this server."));
				//bot.sendMessage(message, "This command is not enabled for this server.");
				isit = false;
			}
			else {
				console.log(colors.red("Command enabled for this server."));
				isit = true;
			}
		}
		cb(isit);
	});
}



//edit the "futuredate" to beginning of next SS or end of current SS
function getNextSSDay(date, dayOfWeek) {

	var resultDate = new Date(date.getTime());

	resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
	//console.log(resultDate);
	if (date.getDay() == 6 && date.getHours() >= 16) {
		resultDate.setDate(date.getDate()+7);
		//console.log(resultDate);
		//console.log(">=15");
	}


	resultDate.setHours(14);
	resultDate.setMinutes(0);
	resultDate.setSeconds(0);
	resultDate.setMilliseconds(0);

	return resultDate;
}


function happeningNow(date, dayOfWeek) {

	var resultDate = new Date(date.getTime());

	resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
	//console.log(resultDate);
	if (date.getDay() == 6 && date.getHours() >= 16) {
		resultDate.setDate(date.getDay()+7);
		//console.log(resultDate);
		//console.log(">=15");
	}

	resultDate.setHours(16);
	resultDate.setMinutes(0);
	resultDate.setSeconds(0);
	resultDate.setMilliseconds(0);

	return resultDate;
}




//get and format duration from now until "futuredate"
function GetCount(message) {

	dateNow = new Date(); //grab current date
	localTime = dateNow.getTime();
	localOffset = dateNow.getTimezoneOffset() * 60000; //convert time offset to milliseconds
	utc = localTime+localOffset;
	amount = getNextSSDay(dateNow, 6).getTime() - dateNow.getTime(); //calc milliseconds between dates
	delete dateNow;

	// time is already past
	if(amount < 0){
		//after event starts
		currentss = 1;
		return GetDown(message); //start second countdown
	}
	// date is still good
	else{
		currentss = 0;
		days=0;hours=0;mins=0;secs=0;out="";

		amount = Math.floor(amount/1000);//kill the "milliseconds" so just secs

		days=Math.floor(amount/86400);//days
		amount=amount%86400;

		hours=Math.floor(amount/3600);//hours
		amount=amount%3600;

		mins=Math.floor(amount/60);//minutes
		amount=amount%60;

		secs=Math.floor(amount);//seconds

		out += "The next SS will begin in ";

		if(days != 0){out += days +" day"+((days!=1)?"s":"")+", ";}
		if(days != 0 || hours != 0){out += hours +" hour"+((hours!=1)?"s":"")+", ";}
		if(days != 0 || hours != 0 || mins != 0){out += mins +" minute"+((mins!=1)?"s":"")+", ";}
		out += secs +" seconds.";
		return out;
		//bot.sendMessage(message, "SS will begin in " + out + ".");

	}
}

function GetDown(message){ //second countdown, for end of event
	currentss = 1;
	currentTime = new Date();
	amount2 = happeningNow(currentTime, 6).getTime() - currentTime.getTime();
	delete currentTime;
	//console.log(amount2);

	if(amount2 < 0){
		currentss = 0;
		bot.sendMessage(message, "Woops, something went wrong.");
		//when event is over
	}

	else{
		days=0;hours=0;mins=0;secs=0;out="";

		amount2 = Math.floor(amount2/1000);//kill the "milliseconds" so just secs

		days=Math.floor(amount2/86400);//days
		amount2=amount2%86400;

		hours=Math.floor(amount2/3600);//hours
		amount2=amount2%3600;

		mins=Math.floor(amount2/60);//minutes
		amount2=amount2%60;

		secs=Math.floor(amount2);//seconds

		out += "SS is currently happening! It will end in ";

		if(days != 0){out += days +" day"+((days!=1)?"s":"")+", ";}
		if(days != 0 || hours != 0){out += hours +" hour"+((hours!=1)?"s":"")+", ";}
		if(days != 0 || hours != 0 || mins != 0){out += mins +" minute"+((mins!=1)?"s":"")+", ";}
		out += secs +" seconds.";
		//console.log(out);
		return out;
		//bot.sendMessage(message, "SS is currently happening! It will end in " + out + ".");
	}
}







//get and format duration from now until "futuredate"
function GetCountEvent(message, dateFuture, eventName) {
	var momentDate = moment(dateFuture)
	dateFuture = momentDate.toDate();
	dateNow = new Date(); //grab current date
	localTime = dateNow.getTime();
	localOffset = dateNow.getTimezoneOffset() * 60000; //convert time offset to milliseconds
	utc = localTime+localOffset;
	amount = dateFuture.getTime() - dateNow.getTime(); //calc milliseconds between dates
	delete dateNow;

	// time is already past
	if(amount < 0){
		//after event starts
		out = eventName + " is currently happening or has passed.";
		return out;
	}
	// date is still good
	else{
		currentss = 0;
		days=0;hours=0;mins=0;secs=0;out="";

		amount = Math.floor(amount/1000);//kill the "milliseconds" so just secs

		days=Math.floor(amount/86400);//days
		amount=amount%86400;

		hours=Math.floor(amount/3600);//hours
		amount=amount%3600;

		mins=Math.floor(amount/60);//minutes
		amount=amount%60;

		secs=Math.floor(amount);//seconds

		out += eventName + " will begin in ";

		if(days != 0){out += days +" day"+((days!=1)?"s":"")+", ";}
		if(days != 0 || hours != 0){out += hours +" hour"+((hours!=1)?"s":"")+", ";}
		if(days != 0 || hours != 0 || mins != 0){out += mins +" minute"+((mins!=1)?"s":"")+", ";}
		out += secs +" seconds.";
		return out;
		//bot.sendMessage(message, "SS will begin in " + out + ".");

	}
}
