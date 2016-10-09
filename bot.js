// <editor-fold desc='requirements'>
var Discord = require("discord.js"); //requirements
var mysql = require("mysql"); //requirements
var colors = require("colors"); //requirements
var jsondata = require("./config/options.json"); //local options
var http = require("http"); //requirements
var fs = require("fs-extra"); //requirements
var parseString = require("xml2js").parseString; //requirements
var Twit = require("twit"); //requirements
var util = require("util"); //requirements
var MySQLConnectionManager = require("mysql-connection-manager"); //requirements
var token = require("./config/logins/discordtoken.json").token;
var twitconfig = require("./config/logins/twitconfig.js"); //local js
var sqlconfig = require("./config/logins/sqlconfig.js"); //local js
var RipWin = require("./modules/RipWin.js"); //local js
var sdr = require("./modules/setdelrole.js"); //local js
var CheckMapID = require("./modules/checkmapid.js"); //local js
var timers = require("./modules/timers.js"); //local js
var Command = require("./modules/command.js"); //local js
var commandList = require("./config/commands.json"); //local json
var md = require("./modules/messagedate.js"); //local js
var cl = require("./modules/chatinfo.js"); //local js
var cmds = require("./modules/commands.js"); //local js
// </editor-fold>


// <editor-fold desc='variables'>
var T = new Twit(twitconfig); //new twitter object
var bot = new Discord.Client(); //create bot
var prefix = jsondata.prefix;
var modrolename = jsondata.modrolename;
var membrolename = jsondata.membrolename;
var botowner = jsondata.botownerid;
var currentss = 0;
var ripwin = null;
var commandname = "";
var isit = false;
var cooldown = false;
var stream = T.stream("statuses/filter", { follow: ["628034104", "241371699"]}); //create tweet filter, first two are refract and torcht, any others for testing
var tweetcount = 0;
var i = 0;
var eventDate = null;
var eventName = null;
var quotespm = "";
var quotespm2 = "";
var info = "";
var connection;
// </editor-fold>


// <editor-fold desc='twitter stream'>
//on new tweet matching filter
stream.on("tweet", function (tweet) {
	var tweetid = tweet.id_str;
	var tweetuser = tweet.user.screen_name;
	console.log(colors.red("Found matching tweet: https://twitter.com/" + tweetuser + "/status/" + tweetid));
	if ((typeof tweet.in_reply_to_screen_name !== "string" || tweet.in_reply_to_user_id === tweet.user.id) && !tweet.text.startsWith("RT @") && (!tweet.text.startsWith("@") || tweet.text.toLowerCase().startsWith("@" + tweet.user.screen_name.toLowerCase())) && (tweet.user.id_str === "628034104" || tweet.user.id_str === "241371699")) {
		var tweetjson = JSON.stringify(tweet,null,2);
		//fs.appendFile("tweet2.json", tweetjson + "\r\n\r\n\r\n\r\n\r\n");
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
		// if (tweet.entities.media) {
		// 	mediaurl = "\r" + tweet.entities.media[0].media_url;
		// }
		// if (tweet.extended_tweet) {
		// 	if (tweet.extended_tweet.entities.media) {
		// 		mediaurl = "\r" + tweet.extended_tweet.entities.media[0].media_url;
		// 	}
		// }
		// if (tweet.entities.urls[0]) {
		// 	if (tweet.entities.urls[0].display_url.startsWith("vine.")) {
		// 		vine = "\r" + tweet.entities.urls[0].expanded_url;
		// 	}
		// }
		bot.channels.get("83078957620002816").sendMessage("https://twitter.com/" + tweetuser + "/status/" + tweetid + mediaurl + vine); //channelid, write message with link to tweet
		//bot.channels.get("211599888222257152").sendMessage("https://twitter.com/" + tweetuser + "/status/" + tweetid + mediaurl + vine); //channelid, write message with link to tweet
	}
});
// </editor-fold>


// <editor-fold desc='twitter API disconnected'>
stream.on("disconnect", function(disconnectMessage) {
	console.log("Twitter stream disconnected: \r\n" + disconnectMessage);
});
// </editor-fold>


// <editor-fold desc='twitter API connection attempt'>
stream.on("connect", function(request) {
	console.log(colors.red("Twitter stream connection attempt."));
});
// </editor-fold>


// <editor-fold desc='twitter API connected'>
stream.on("connected", function(response) {
	console.log(colors.red("Twitter stream connected."));
});
// </editor-fold>


// <editor-fold desc='twitter API reconnect attempt'>
stream.on("reconnect", function(request, response, connectInterval) {
	console.log(colors.red("Twitter stream attemptng reconnect in " + connectInterval + "ms."));
});
// </editor-fold>


// <editor-fold desc='twitter API error'>
stream.on("error", function(error) {
	console.log("Twitter stream error: \r\n" + error);
});
// </editor-fold>


// <editor-fold desc='mysql database connect'>
//connect to mysql server
connection = mysql.createConnection(sqlconfig);
var manager = new MySQLConnectionManager(sqlconfig, connection);
connection.connect();
// </editor-fold>


// <editor-fold desc='mysql error'>
connection.on("error", function(error) {
	console.log("MySQL error: \r\n" + error);
});
// </editor-fold>


// <editor-fold desc='mysql manager connect'>
manager.on("connect", function(connection) {
	console.info(colors.red("MySQL connected."));
});
// </editor-fold>


// <editor-fold desc='mysql manager connect'>
manager.on("reconnect", function(connection) {
	console.log(colors.red("MySQL reconnected."));
});
// </editor-fold>


// <editor-fold desc='mysql manager connect'>
manager.on("disconnect", function() {
	console.log("MySQL disconnected.");
});
// </editor-fold>


// <editor-fold desc='server unavailable'>
bot.on("guildUnavailable", (guild) => {
	console.log(guild.name + " unavailable.");
});
// </editor-fold>


// <editor-fold desc='bot reconnecting'>
bot.on("reconnecting", () => {
	console.log(colors.red("Reconnecting..."));
});
// </editor-fold>


// <editor-fold desc='bot on ready'>
//log to console when ready
bot.on("ready", () => {
	console.log(colors.red("Bot online and ready on " + bot.guilds.size + " server(s)."));
	bot.user.setStatus("online", "Distance", function (error) {
		if (error) {
			console.log(error);
		}
	});
});
// </editor-fold>


// <editor-fold desc='bot on disconnect'>
//handle disconnect
bot.on("disconnect", () => {
	console.log(colors.red("Bot disconnected from server."));
});
// </editor-fold>


// <editor-fold desc='bot on server join'>
//add new servers to mysql database when bot added to new server
bot.on("guildCreate", (guild) => {
	console.log(colors.red("Trying to insert server '" + guild.name + "' into database."));
	info = {
		"servername": "'" + guild.name + "'",
		"serverid": guild.id,
		"ownerid": guild.owner.id,
		"prefix": "!"
	};
	connection.query("INSERT INTO servers SET ?", info, function(error) {
		if (error) {
			console.log(error);
			return;
		}
		else {
			console.log(colors.red("Successfully inserted server."));
		}
	});
	console.log(colors.red("Trying to insert win quotes for server '" + guild.name + "'."));
	connection.query("INSERT INTO win (server_id, quote) SELECT \"113151199963783168\", quote FROM win WHERE server_id = \"" + guild.id + "\"", function(error) {
		if (error) {
			console.log(error);
			return;
		}
		else {
			console.log(colors.red("Successfully inserted win quotes."));
		}
	});
	console.log(colors.red("Trying to insert rip quotes for server '" + guild.name + "'."));
	connection.query("INSERT INTO rip (server_id, quote) SELECT \"113151199963783168\", quote FROM win WHERE server_id = \"" + guild.id + "\"", function(error) {
		if (error) {
			console.log(error);
			return;
		}
		else {
			console.log(colors.red("Successfully inserted win quotes."));
		}
	});
});
// </editor-fold>


// <editor-fold desc='bot on server kicked'>
//remove server from mysql database when bot kicked
bot.on("guildDelete", (guild) => {
	if (guild.available) { //ensure kick rather than server outtage
		console.log(colors.red("Attempting to remove " + guild.name + " from the database."));
		connection.query("DELETE FROM servers WHERE serverid = '" + guild.id + "'", function(error) {
			if (error) {
				console.log(error);
				return;
			}
			console.log(colors.red("Successfully removed server."));
		});
	}
});
// </editor-fold>


// <editor-fold desc='bot on message edit'>
bot.on("messageUpdate", (oldMessage, newMessage) => {
	if (bot.user !== oldMessage.author || bot.user !== newMessage.author) {
		if (oldMessage.content !== newMessage.content) {

			var newc = cl.formatChatlog(newMessage);
			var oldc = cl.formatChatlog(oldMessage);

			fs.readFile(oldc.currentLog, function(error, data) {
				if (error) {
					console.log(error);
				}
				else {
					var array = data.toString().split("\r\n");
					i = 0;
					for(i; i < array.length; i++) {
						if (!array[i].startsWith("http") && (array[i] === oldc.chatlinedata || array[i] === "(Edited) " + oldc.chatlinedata)) {
							array[i] = "(Edited) " + newc.chatlinedata;
						}
					}
					fs.writeFile(oldc.currentLog, array.join("\r\n"), function(error) {
						if (error) {
							console.log(error);
						}
						else {
							console.log(colors.white.dim("Edited --> " + newc.consoleChat));
						}
					});
				}
			});
			fs.readFile(oldc.fullLog, function(error, data) {
				if (error) {
					console.log(error);
				}
				else {
					var array = data.toString().split("\r\n");
					i = 0;
					for(i; i < array.length; i++) {
						if (!array[i].startsWith("http") && (array[i] === oldc.chatlinedata || array[i] === "(Edited) " + oldc.chatlinedata)) {
							array[i] = "(Edited) " + newc.chatlinedata;
						}
					}
					fs.writeFile(oldc.fullLog, array.join("\r\n"), function(error) {
						if (error) {
							console.log(error);
						}
						else {
							console.log(colors.white.dim("Edited --> " + newc.consoleChat));
						}
					});
				}
			});
		}
	}
});
// </editor-fold>


// <editor-fold desc='when server user updates'>
bot.on("guildMemberUpdate", (guild, oldMember, newMember) => {
	var guildChannels = guild.channels.array();
	var currentDate = new Date();
	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
	var currentYear = currentDate.getFullYear();
	var currentMonth = monthNames[currentDate.getMonth()];
	if (oldMember.nickname) {
		if (newMember.nickname) {
			if (oldMember.nickname !== newMember.nickname) {
				i = 0;
				for(i; i < guildChannels.length; i++) {
					if (guildChannels[i].type === "text") {
						fs.appendFile(jsondata.logLocation + guild.name + "/" + guildChannels[i].name + "/" + currentYear + "/" + currentMonth + ".log", "* " + oldMember.nickname + " is now known as " + newMember.nickname + "\r\n", function(error) {
							if (error) {
								console.log(error);
							}
						});
						fs.appendFile(jsondata.logLocation + guild.name + "/full_logs/" + guildChannels[i].name + ".log", "* " + oldMember.nickname + " is now known as " + newMember.nickname + "\r\n", function(error) {
							if (error) {
								console.log(error);
							}
							else {
								//console.log(colors.white.dim("* " + oldMember.nickname + " is now known as " + newMember.nickname));
							}
						});
					}
				}
				console.log(colors.white.dim("* " + oldMember.nickname + " is now known as " + newMember.nickname));
			}
		}
		else {
			i = 0;
			for(i; i < guildChannels.length; i++) {
				if (guildChannels[i].type === "text") {
					fs.appendFile(jsondata.logLocation + guild.name + "/" + guildChannels[i].name + "/" + currentYear + "/" + currentMonth + ".log", "* " + oldMember.nickname + " is now known as " + newMember.user.username + "\r\n", function(error) {
						if (error) {
							console.log(error);
						}
					});
					fs.appendFile(jsondata.logLocation + guild.name + "/full_logs/" + guildChannels[i].name + ".log", "* " + oldMember.nickname + " is now known as " + newMember.user.username + "\r\n", function(error) {
						if (error) {
							console.log(error);
						}
						else {
							//console.log(colors.white.dim("* " + oldMember.nickname + " is now known as " + newMember.user.username));
						}
					});
				}
			}
			console.log(colors.white.dim("* " + oldMember.nickname + " is now known as " + newMember.user.username));
		}
	}
	else if (newMember.nickname) {
		i = 0;
		for(i; i < guildChannels.length; i++) {
			if (guildChannels[i].type === "text") {
				fs.appendFile(jsondata.logLocation + guild.name + "/" + guildChannels[i].name + "/" + currentYear + "/" + currentMonth + ".log", "* " + oldMember.user.username + " is now known as " + newMember.nickname + "\r\n", function(error) {
					if (error) {
						console.log(error);
					}
				});
				fs.appendFile(jsondata.logLocation + guild.name + "/full_logs/" + guildChannels[i].name + ".log", "* " + oldMember.user.username + " is now known as " + newMember.nickname + "\r\n", function(error) {
					if (error) {
						console.log(error);
					}
					else {
						//console.log(colors.white.dim("* " + oldMember.nickname + " is now known as " + newMember.user.username));
					}
				});
			}
		}
		console.log(colors.white.dim("* " + oldMember.user.username + " is now known as " + newMember.nickname));
	}
});
// </editor-fold>


//--------------------------Begin bot commands--------------------------
bot.on("message", (message) => {
	if (message.guild) { //non-pm messages

		var cha = cl.formatChatlog(message);

		fs.appendFile(cha.currentLog, cha.chatlinedata + cha.formattedAtturls + "\r\n", function(error) {
			if (error) {
				console.log(message.content);
				console.log(error);
			}
			else {
				console.log(colors.white(cha.consoleChat + cha.formattedAtturls));
			}
		});
		fs.appendFile(cha.fullLog, cha.chatlinedata + cha.formattedAtturls + "\r\n", function(error) {
			if (error) {
				console.log(message.content);
				console.log(error);
			}
		});


		//add new members to member role
		if (!message.guild.members.get(message.author.id).roles.exists("name", membrolename)) {
			//console.log(message.guild.roles.find("name", modrolename));
			connection.query("SELECT commandname FROM commands WHERE server_id=" + message.guild.id + " AND commandname='automemb'", function(error, enabledforserver) {
				if (error) {
					message.channel.sendMessage(message, "Failed.");
					console.log(error);
					return;
				}
				else {
					if (typeof enabledforserver[0] !== "object") {
						if (cha.user.isbot !== "{BOT}") {
							console.log(colors.red("Automemb not enabled for this server."));
						}
					}
					else {

						if (cha.user.toprole.name !== "Guest" && cha.user.isbot !== "{BOT}") {
							console.log("User isn't guest?");
						}

						var botcanassign = false;
						var bu = cl.getMaxRole(message.guild.members.get(bot.user.id));
						if (bu.toprole.name === "Guest") {
							console.log(colors.red("Bot cannot assign (Bot is guest)."));
						}
						else {

							if (bu.toprole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
								if (bu.toprole.position <= cha.user.toprole.position) {
									botcanassign = false;
								}
								else if (bu.toprole.position - 1 === cha.user.toprole.position) {
									botcanassign = false;
								}
								else {
									botcanassign = true;
								}
							}
							else {
								botcanassign = false;
							}
						}
						if (botcanassign && cha.user.isbot !== "{BOT}") {
							message.member.addRole(message.guild.roles.find("name", membrolename));
							if (message.guild.id === "83078957620002816") {
								message.reply("Welcome to the discord! You are now a " + membrolename + ". Make sure to read the #rules_and_info channel.");
							}
							else {
								message.reply("Welcome to the discord! You are now a " + membrolename + ".");
							}

						}
						else if (cha.user.isbot === "{BOT}") {
							return;
						}
						else {
							console.log(colors.red("Bot does not have permission to assign " + membrolename + "."));
						}
					}
				}
			});
		}



		var messagesent = false;


		//check for command
		if (message.content.startsWith(prefix)) {
			var str = message.content;
			var results = str.split(" ");
			results[0] = results[0].replace(prefix, "");


			//check for custom server command
			connection.query("SELECT comtext, modonly, inpm FROM servcom WHERE server_id=" + message.guild.id + " AND comname='" + results[0] + "'", function(error, returntext) {
				if (error) {
					console.log(error);
					return;
				}
				else {
					//console.log(typeof returntext[0]);
					if (typeof returntext[0] === "object") {
						if (returntext[0].modonly === "true" && message.member.roles.exists("name", modrolename)) {
							var strs = returntext[0].comtext;
							results = strs.slice(1,strs.length-1);
							if (returntext[0].inpm === "true") {
								message.author.sendMessage(results);
							}
							else if (returntext[0].inpm === "false") {
								message.channel.sendMessage(message, results);
							}
							messagesent = true;
						}
						else if (returntext[0].modonly === "false") {
							var stre = returntext[0].comtext;
							results = stre.slice(1,stre.length-1);
							if (returntext[0].inpm === "true") {
								message.author.sendMessage(results);
							}
							else if (returntext[0].inpm === "false") {
								message.channel.sendMessage(results);
							}
							messagesent = true;
						}
						else {
							message.channel.sendMessage("This is a " + modrolename + "-only command.");
						}
					}
				}
			});







			if(!messagesent) {
				if (message.content.startsWith(prefix + "addcomtoserv")) {
					cmds.addcomtoserv(message, results, connection);
				}
				else if (message.content.startsWith(prefix + "remcomfromserv")) {
					cmds.delcomfromserv(message, results, connection);
				}
				else if (message.content.startsWith(prefix + "newcom")) {
					cmds.newcom(message, results, connection);
				}
				else if (message.content.startsWith(prefix + "delcom")) {
					cmds.delcom(message, results, connection);
				}
				else if (message.content.startsWith(prefix + "test")) {
					cmds.test(message);
				}
				else if (message.content.startsWith(prefix + "dist")) {
					cmds.dist(message, results, connection, http);
				}
				else if (message.content.startsWith(prefix + "wr")) {
					cmds.wr(message, results, connection, http);
				}
				else if (message.content.startsWith(prefix + "ss")) {
					cmds.ss(message, results, connection);
				}
				else if (message.content.startsWith(prefix + "advent")) {
					cmds.advent(message, results, connection);
				}
				else if (message.content.startsWith(prefix + "speedy")) {
					cmds.speedy(message, results, connection);
				}
				else if (message.content.startsWith(prefix + "commands") || message.content.startsWith(prefix + "cmds") || message.content.startsWith(prefix + "help")) {
					cmds.help(message, results, connection);
				}
				else if (message.content.startsWith(prefix + "role")) {
					cmds.role(bot, message, results, connection);
				}
				else if (message.content.startsWith(prefix + "win") || message.content.startsWith(prefix + "rip")|| message.content.startsWith(prefix + "tf")) {
					cmds.ripwin(message, results, connection);
				}
			}
		}

		//-----------------------------------------------

	}

	else { //pm messages
		console.log(colors.grey("(Private) " + message.author.username + ": " + message.cleanContent));
		if (message.content.startsWith(prefix)) {
			message.author.sendMessage("Using commands via PM is not supported as I have no indication of which server you want to access the commands for. Please use the command from within the server - To view which commands are enabled for your server, use `" + prefix + "cmds` within that server.");
		}
	}
});




//catch errors
bot.on("error", (e) => { console.error(colors.green(e)); });
bot.on("warn", (e) => { console.warn(colors.blue(e)); });
bot.on("debug", (e) => { console.info(colors.yellow(e)); });




//discord login
bot.login(token);
