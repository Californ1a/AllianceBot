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
//var moment = require("moment"); //requirements
var token = require("./config/logins/discordtoken.json").token;
var twitconfig = require("./config/logins/twitconfig.js"); //local js
var sqlconfig = require("./config/logins/sqlconfig.js"); //local js
var RipWin = require("./modules/RipWin.js"); //local js
var setDelRole = require ("./modules/setdelrole.js"); //local js
var CheckMapID = require("./modules/checkmapid.js"); //local js
var timers = require("./modules/timers.js"); //local js
var Command = require("./modules/command.js"); //local js
var commandList = require("./config/commands.json"); //local json
var md = require("./modules/messagedate.js"); //local js
// </editor-fold>

var hardCode = [];
for (var i = 0; i < commandList.length; i++) {
	hardCode[i] = new Command(commandList[i]);
}


// <editor-fold desc='variables'>
var T = new Twit(twitconfig); //new twitter object
var bot = new Discord.Client(); //create bot
var prefix = jsondata.prefix;
var modrolename = jsondata.modrolename;
var membrolename = jsondata.membrolename;
var botowner = jsondata.botownerid;
var currentss = 0;
var ripwin = null;
var chatlinedata = ""; //chatlog string
var commandname = "";
//var hardcommands = [{comName:"newcom", onCooldown:"false"}, {comName:"delcom", onCooldown:"false"}, {comName:"dist", onCooldown:"false"}, {comName:"wr", onCooldown:"false"}, {comName:"ss", onCooldown:"false"}, {comName:"speedy", onCooldown:"false"}, {comName:"cmds", onCooldown:"false"}, {comName:"commands", onCooldown:"false"}, {comName:"help", onCooldown:"false"}, {comName:"setrole", onCooldown:"false"}, {comName:"delrole", onCooldown:"false"}, {comName:"win", onCooldown:"false"}, {comName:"rip", onCooldown:"false"}, {comName:"test", onCooldown:"false"}, {comName:"advent", onCooldown:"false"}];
var isit = false;
var cooldown = false;
var stream = T.stream("statuses/filter", { follow: ["628034104", "241371699"]}); //create tweet filter, first two are refract and torcht, any others for testing
var tweetcount = 0;
var eventDate = null;
var eventName = null;
// </editor-fold>


// <editor-fold desc='twitter stream'>
//on new tweet matching filter
stream.on("tweet", function (tweet) {
	var tweetid = tweet.id_str;
	var tweetuser = tweet.user.screen_name;
	console.log(colors.red("Found matching tweet: https://twitter.com/" + tweetuser + "/status/" + tweetid)); //console link to tweet
	if ((typeof tweet.in_reply_to_user_id !== "object" || tweet.in_reply_to_user_id === tweet.user.id) && !tweet.text.startsWith("RT @") && !tweet.text.startsWith("@") && (tweet.user.screen_name === "torcht" || tweet.user.screen_name === "refractstudios")) {
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
		if (typeof tweet.entities.urls === "object") {
			if (tweet.entities.urls[0].display_url.startsWith("vine.")) {
				vine = "\r" + tweet.entities.urls[0].expanded_url;
			}
		}
		bot.channels.get("211599888222257152").sendMessage("https://twitter.com/" + tweetuser + "/status/" + tweetid + mediaurl + vine); //channelid, write message with link to tweet
	}
});
// </editor-fold>


// <editor-fold desc='mysql database connect'>
//connect to mysql server
var connection = mysql.createConnection(sqlconfig);
connection.connect();
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
bot.on("disconnected", () => {
	console.log(colors.red("Bot disconnected from server."));
});
// </editor-fold>


// <editor-fold desc='bot on server join'>
//add new servers to mysql database when bot added to new server
bot.on("serverCreated", (server) => {
	console.log(colors.red("Trying to insert server '" + server.name + "' into database."));
	var info = {
		"servername": "'" + server.name + "'",
		"serverid": server.id,
		"ownerid": server.owner.id,
		"prefix": "!"
	};
	// connection.query("INSERT INTO servers SET ?", info, function(error) {
	// 	if (error) {
	// 		console.log(error);
	// 		return;
	// 	}
	// 	else {
	// 		console.log(colors.red("Successfully inserted server."));
	// 	}
	// });
	console.log("inserted");
});
// </editor-fold>


// <editor-fold desc='bot on server kicked'>
//remove server from mysql database when bot kicked
bot.on("serverDeleted", (server) => {
	console.log(colors.red("Attempting to remove " + server.name + " from the database."));
	// connection.query("DELETE FROM servers WHERE serverid = '" + server.id + "'", function(error) {
	// 	if (error) {
	// 		console.log(error);
	// 		return;
	// 	}
	// 	console.log(colors.red("Successfully removed server."));
	// });
	console.log("removed");
});
// </editor-fold>


// <editor-fold desc='bot on message edit'>
bot.on("messageUpdate", (oldMessage, newMessage) => {

	// <editor-fold desc='newmessage matching'>
	var newchatlog = "E:/OtherStuff/DiscordChatlogs2/";
	var newMessageTime = md.messageDate(newMessage);
	var newuserrole = newMessage.guild.members.get(newMessage.author.id);
	var maxpos = 0;
	var newisbot = "";
	var newchatlinedata = "";
	//console.log(newuserrole.roles);
	if (newuserrole.roles.size === 0) {
		newuserrole = "Guest";
		if (newMessage.author.bot) {
			newisbot = "{BOT}";
		}
	}
	else {

		//find max role of user
		for (var i = 0; i < newMessage.guild.roles.size+1; i++) {
			maxpos = newuserrole.roles.exists("position",i) && newuserrole.roles.find("position",i).position > maxpos ? newuserrole.roles.find("position",i).position : maxpos;
			// if (newuserrole.roles.exists("position",i) && newuserrole.roles.find("position",i).position > maxpos) {
			// 	maxpos = newuserrole.roles.find("position",i).position;
			// }
		}
		var newtoprole = newMessage.guild.roles.find("position", maxpos);

		newuserrole = newtoprole.name;
		if (newMessage.author.bot) {
			newisbot = "{BOT}";
		}
	}
	newchatlog = newchatlog + newMessage.guild.name + "/" + newMessage.channel.name + "/" + newMessageTime.year + "/" + newMessageTime.month + ".txt";
	if (newMessage.guild.members.get(newMessage.author.id).nick) {
		newchatlinedata = newMessageTime.thedate + " | " + newisbot + "(" + newuserrole + ")" + newMessage.guild.members.get(newMessage.author.id).nick + ": " + newMessage.cleanContent;
	}
	else {
		newchatlinedata = newMessageTime.thedate + " | " + newisbot + "(" + newuserrole + ")" + newMessage.author.username + ": " + newMessage.cleanContent;
	}
	// </editor-fold>

	// <editor-fold desc='oldmessage matching'>
	var oldchatlog = "E:/OtherStuff/DiscordChatlogs2/";
	var oldMessageTime = md.messageDate(oldMessage);
	var userrole = oldMessage.guild.members.get(oldMessage.author.id);
	maxpos = 0;
	var isbot = "";
	var oldchatlinedata = "";
	//console.log(userrole.roles);
	if (userrole.roles.size === 0) {
		userrole = "Guest";
		if (oldMessage.author.bot) {
			isbot = "{BOT}";
		}
	}
	else {

		//find max role of user
		for (var i = 0; i < oldMessage.guild.roles.size+1; i++) {
			maxpos = userrole.roles.exists("position",i) && userrole.roles.find("position",i).position > maxpos ? userrole.roles.find("position",i).position : maxpos;
			// if (userrole.roles.exists("position",i) && userrole.roles.find("position",i).position > maxpos) {
			// 	maxpos = userrole.roles.find("position",i).position;
			// }
		}
		var toprole = oldMessage.guild.roles.find("position", maxpos);

		userrole = toprole.name;
		if (oldMessage.author.bot) {
			isbot = "{BOT}";
		}
	}
	oldchatlog = oldchatlog + oldMessage.guild.name + "/" + oldMessage.channel.name + "/" + oldMessageTime.year + "/" + oldMessageTime.month + ".txt";
	if (oldMessage.guild.members.get(oldMessage.author.id).nick) {
		oldchatlinedata = oldMessageTime.thedate + " | " + isbot + "(" + userrole + ")" + oldMessage.guild.members.get(oldMessage.author.id).nick + ": " + oldMessage.cleanContent;
	}
	else {
		oldchatlinedata = oldMessageTime.thedate + " | " + isbot + "(" + userrole + ")" + oldMessage.author.username + ": " + oldMessage.cleanContent;
	}
	// </editor-fold>
	fs.readFile("E:/OtherStuff/DiscordChatlogs2/" + oldMessage.guild.name + "/" + oldMessage.channel.name + "/" + oldMessageTime.year + "/" + oldMessageTime.month + ".txt", function(error, data) {
		if (error) {
			console.log(error);
		}
		else {
			var array = data.toString().split("\r\n");
			//console.log(array[0]);
			for(var i = 0; i < array.length; i++) {
				//console.log(array[i]);
				// array[i] = array[i].replace("\r","");
				// array[i] = array[i].replace("\n","");
				// oldchatlinedata = oldchatlinedata.replace("\r","");
				// oldchatlinedata = oldchatlinedata.replace("\n","");
				// console.log(array[i]);
				// console.log(oldchatlinedata);
				if (array[i] === oldchatlinedata) {
					// console.log("yes");

					array[i] = newchatlinedata;
					//array.splice(i+1,0,"(Edited -->) " + newMessage.cleanContent);

					fs.writeFile("E:/OtherStuff/DiscordChatlogs2/" + oldMessage.guild.name + "/" + oldMessage.channel.name + "/" + oldMessageTime.year + "/" + oldMessageTime.month + ".txt", array.join("\r\n"), function(error) {
						if (error) {
							console.log(error);
						}
						// else {
						// 	console.log("wrote file");
						// }
					});
				}
			}
		}
	});



  //var chatlogArray = loadStrings("E:/OtherStuff/DiscordChatlogs2/" + oldMessage.guild.name + "/" + oldMessage.channel.name + "/" + yearthen + "/" + monthNames[oldMonthIndex] + ".txt");
	// fs.readFile("E:/OtherStuff/DiscordChatlogs2/" + oldMessage.guild.name + "/" + oldMessage.channel.name + "/" + yearthen + "/" + monthNames[oldMonthIndex] + ".txt", function(err, data) {
  //   if(err) throw err;
  //   var array = data.toString().split("\n");
	// 	console.log(array[0]);
  //   for(i in array) {
  //       console.log(array[i]);
  //   }
	// });
});
// </editor-fold>


//--------------------------Begin bot commands--------------------------
bot.on("message", (message) => {
var chatlog = "E:/OtherStuff/DiscordChatlogs2/";
	if (message.guild) { //non-pm messages

		var messageTime = md.messageDate(message);

		var userrole = message.guild.members.get(message.author.id);
		var isbot = "";
		var maxpos = 0;
		var toprole = "";
		//console.log(userrole.roles);
		if (userrole.roles.size === 0) {
			userrole = "Guest";
			if (message.author.bot) {
				isbot = "{BOT}";
			}
		}
		else {

			//find max role of user
			for (var i = 0; i < message.guild.roles.size+1; i++) {
				maxpos = userrole.roles.exists("position",i) && userrole.roles.find("position",i).position > maxpos ? userrole.roles.find("position",i).position : maxpos;
				// if (userrole.roles.exists("position",i) && userrole.roles.find("position",i).position > maxpos) {
				// 	maxpos = userrole.roles.find("position",i).position;
				// }
			}
			toprole = message.guild.roles.find("position", maxpos);

			userrole = toprole.name;
			if (message.author.bot) {
				isbot = "{BOT}";
			}
		}

		fs.mkdirs(chatlog + message.guild.name + "/" + message.channel.name + "/" + messageTime.year, function(error) {
			if (error) {
				console.log(error);
				return;
			}
			else {
				//console.log("made");
			}
		});
		if (message.attachments.length > 0) {
			chatlog = chatlog + message.guild.name + "/" + message.channel.name + "/" + messageTime.year + "/" + messageTime.month + ".txt";
			if (message.guild.members.get(message.author.id).nick) {
				chatlinedata = messageTime.thedate + " | " + isbot + "(" + userrole + ")" + message.guild.members.get(message.author.id).nick + ": " + message.cleanContent + "\r\n" + message.attachments[0].url + "\r\n";
			}
			else {
				chatlinedata = messageTime.thedate + " | " + isbot + "(" + userrole + ")" + message.author.username + ": " + message.cleanContent + "\r\n" + message.attachments[0].url + "\r\n";
			}
			fs.appendFile(chatlog, chatlinedata, function(error) {
				if (error) {
					console.log(error);
				}
				else {
					if (message.guild.members.get(message.author.id).nick) {
						console.log(colors.white(messageTime.hour + ":" + messageTime.minute + messageTime.ampm + " [" + message.guild.name + "/#" + message.channel.name + "] " + isbot + "(" + userrole + ")" + message.guild.members.get(message.author.id).nick + ": " + message.cleanContent));
					}
					else {
						console.log(colors.white(messageTime.hour + ":" + messageTime.minute + messageTime.ampm + " [" + message.guild.name + "/#" + message.channel.name + "] " + isbot + "(" + userrole + ")" + message.author.username + ": " + message.cleanContent));
					}
					console.log(colors.white(message.attachments[0].url));
				}
			});
		}
		else {
			chatlog = chatlog + message.guild.name + "/" + message.channel.name + "/" + messageTime.year + "/" + messageTime.month + ".txt";
			if (message.guild.members.get(message.author.id).nick) {
				chatlinedata = messageTime.thedate + " | " + isbot + "(" + userrole + ")" + message.guild.members.get(message.author.id).nick + ": " + message.cleanContent + "\r\n";
			}
			else {
				chatlinedata = messageTime.thedate + " | " + isbot + "(" + userrole + ")" + message.author.username + ": " + message.cleanContent + "\r\n";
			}

			fs.appendFile(chatlog, chatlinedata, function(error) {
				if (error) {
					console.log(error);
				}
				else {
					if (message.guild.members.get(message.author.id).nick) {
						console.log(colors.white(messageTime.hour + ":" + messageTime.minute + messageTime.ampm + " [" + message.guild.name + "/#" + message.channel.name + "] " + isbot + "(" + userrole + ")" + message.guild.members.get(message.author.id).nick + ": " + message.cleanContent));
					}
					else {
						console.log(colors.white(messageTime.hour + ":" + messageTime.minute + messageTime.ampm + " [" + message.guild.name + "/#" + message.channel.name + "] " + isbot + "(" + userrole + ")" + message.author.username + ": " + message.cleanContent));
					}
				}
			});
		}



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
						console.log(colors.red("Automemb not enabled for this server."));
					}
					else {
						var botcanassign = false;
						if (userrole === "Guest") {
							console.log(colors.red("User is Guest."));
							toprole = 0;
						}
						else {
							console.log("User isn't guest?");
						}
						var userrole3 = message.guild.members.get(bot.user.id);
						if (userrole3.roles.length === 0) {
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
							var toprole3 = message.guild.roles.find("position", maxpos2);

							if (toprole3.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
								botcanassign = true;
								if (toprole3.position <= toprole.position) {
									botcanassign = false;
								}
								else if (toprole3.position - 1 === toprole.position) {
									botcanassign = false;
								}
							}
							else {
								botcanassign = false;
							}
						}
						if (botcanassign) {
							bot.addMemberToRole(message.author, message.guild.roles.find("name", membrolename));
							bot.reply(message, "Welcome to the discord! You are now a " + membrolename + ".");
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
			var ref = 0;
			for (var i = 0; i < hardCode.length; i++) {
				if (hardCode[i].name === results[0].replace(prefix,"")) {
					ref = i;
				}
			}

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
					if (message.author.id === botowner || message.guild.owner.equals(message.author)) {
						if (results.length <= 2) {
							if (typeof results[1] !== "string") {
								message.channel.sendMessage("To view the help for this command use `" + prefix + "addcomtoserv help`.");
							}
							else if (results[1] === "help") {
								message.channel.sendMessage("Syntax: __**`" + prefix + "addcometoserv <command name>`**__\rUsed to enable hardcoded commands on the server, only available to the bot owner and server owner.\r\r`command name`\rName of command without prefix.\r\r**Example**\r`" + prefix + "addcomtoserv advent`\rThis will enable the hardcoded `" + prefix + "advent` command.");
							}
							else {
								var iscommand = false;
								for (var i = 0; i < hardCode.length; i++) {
									if (hardCode[i].name === results[1]) {
										iscommand = true;
									}
								}
								if (iscommand) {
									if (results[1].includes(prefix)) {
										message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "remcomfromserv help` to view the syntax help.");
									}
									else {
										//database
										console.log(colors.red("Trying to insert command '" + results[1] + "' into database."));
										var info = {
											"commandname": results[1],
											"server_id": message.guild.id,
										};
										connection.query("INSERT INTO commands SET ?", info, function(error) {
											if (error) {
												console.log(error);
												message.channel.sendMessage("Failed.");
												return;
											}
											else {
												console.log(colors.red("Successfully added command to server."));
												message.channel.sendMessage("Successfully added command to server.");
											}
										});
									}
								}
								else {
									message.channel.sendMessage("`" + results[1] + "` is not a recognized command.");
								}
							}
						}
						else {
							message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "addcomtoserv help` to view the syntax help.");
						}
					}
				}

				else if (message.content.startsWith(prefix + "remcomfromserv")) {
					if (message.author.id === botowner || message.guild.owner.equals(message.author)) {
						if (results.length <= 2) {
							if (typeof results[1] !== "string") {
								message.channel.sendMessage("To view the help for this command use `" + prefix + "remcomfromserv help`.");
							}
							else if (results[1] === "help") {
								message.channel.sendMessage("Syntax: __**`" + prefix + "remcomefromserv <command name>`**__\rDisables a hardcoded command on this server. Only available for bot owner and server owner.\r\r`command name`\rName of the command to be disabled without the prefix.\r\r**Example**\r`" + prefix + "remcomfromserv advent`\rThis will disable the `" + prefix + "advent` command.");
							}
							else {
								if (results[1].includes(prefix)) {
									message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "remcomfromserv help` to view the syntax help.");
								}
								else {
									//database
									console.log(colors.red("Trying to remove command '" + results[1] + "' from database."));
									connection.query("DELETE FROM commands WHERE commandname='" + results[1] + "' AND server_id=" + message.guild.id, function(error) {
										if (error) {
											console.log(error);
											message.channel.sendMessage("Failed.");
											return;
										}
										else {
											console.log(colors.red("Successfully removed command from server."));
											message.channel.sendMessage("Successfully removed command from server.");
										}
									});
								}
							}
						}
						else {
							message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "remcomfromserv help` to view the syntax help.");
						}
					}
				}


				else if (message.content.startsWith(prefix + "newcom")) {
					hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							if (message.member.roles.exists("name", modrolename)) {
								var str = message.content.toString();
								results = str.split(" ");
								if (typeof results[1] !== "string") {
									message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help.");
								}
								else if (results[1] === "help") {
									message.channel.sendMessage("Syntax: __**`" + prefix + "newcom <command name> <mod-only> <reply-in-pm> <message>`**__\rUsed to create custom commands.\r\r`command name`\rName of command without prefix\r\r`mod-only (true|false)`\rOnly " + modrolename + "s can use the command.\r\r`reply-in-pm (true|false)`\rReply to command in a PM rather than in-channel.\r\r`message`\rThe message to be sent when command is given.\r\r**Example**\r`" + prefix + "newcom spook false false BOO! Scared ya!`\rThe new command would be `" + prefix + "spook` (enabled for all members, not just " + modrolename + "s & would reply in-channel) and the returned message would be `BOO! Scared ya!`");
								}
								else if (results[1].includes(prefix)) {
									message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help.");
								}
								else if (results.length === 2) {
									message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help.");
								}
								else if (results.length === 3) {
									message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help.");
								}
								else if (results.length === 4) {
									message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help.");
								}
								else if ((results[2] !== "true") && (results[2] !== "false")) {
									message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help. " + results[2]);
								}
								else if ((results[3] !== "true") && (results[3] !== "false")) {
									message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "newcom help` for help. " + results[2]);
								}
								else {
									var recombined = "";
									for (i = 0; i < results.length-4; i++) {
										if (i !== results.length-5) {
											recombined += results[i+4] + " ";
										}
										else {
											recombined += results[i+4];
										}
									}
									console.log(colors.red("Attempting to add the command `" + prefix + results[1] + "` with the resulting message `" + recombined + "` to server `" + message.guild.name + "`."));
									var info = {
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
										}
										else {
											console.log(colors.red("Successfully inserted command."));
											message.channel.sendMessage("Success.");
										}
									});
								}
							}
							else {
								bot.reply(message, "Only " + modrolename + "s can add commands.");
							}
							hardCode[ref].timeout();
						}
					});
				}



				else if (message.content.startsWith(prefix + "delcom")) {
					hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							if (message.member.roles.exists("name", modrolename)) {
								var str = message.content.toString();
								results = str.split(" ");
								if (typeof results[1] !== "string") {
									message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "delcom help` for help.");
								}
								else if (results[1] === "help") {
									message.channel.sendMessage("Syntax: `" + prefix + "delcom <command name>`\rUsed to delete custom commands.\r\r`command name`\rName of command to be deleted, without prefix.\r\r**Example**\r`" + prefix + "delcom spook`\rThis will remove the `" + prefix + "spook` command.");
								}
								else if (results[1].includes(prefix)) {
									message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "delcom help` for help.");
								}
								else if (results.length >= 3) {
									message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "delcom help` for help.");
								}
								else {
									console.log(colors.red("Attempting to remove the command `" + prefix + results[1] + "` from server `" + message.guild.name + "`."));
									connection.query("DELETE FROM servcom WHERE comname='" + results[1] + "' AND server_id=" + message.guild.id, function(error) {
										if (error) {
											console.log(error);
											message.channel.sendMessage("Failed.");
											return;
										}
										else {
											console.log(colors.red("Successfully removed command."));
											message.channel.sendMessage("Success.");
										}
									});
								}
							}
							else {
								bot.reply(message, "Only " + modrolename + "s can delete commands.");
							}
							hardCode[ref].timeout();
						}
					});
				}



				//test

				else if (message.content.startsWith(prefix + "test")) {
					hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							console.log("test");
						}
					});
				}



				else if (message.content.startsWith(prefix + "dist")) {
					hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							var mapid = null;
							if (typeof results[1] !== "string") {
								message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "dist help` for syntax help.");
							}
							else if (results[1] === "help") {
								message.channel.sendMessage("Syntax: __**`" + prefix + "dist <map name> <mode>`**__\rReturn the current #1 time on a specified map. May take a few seconds to reply, the Steam request is fairly slow.\r\r`map name`\rThe name of the map. Only official maps are supported, no workshop. Abbreviations and full names are both supported (`ttam` = `machines` = `the thing about machines`).\r\r`mode`\rThe mode. This is only necessary when requesting a Sprint or Speed and Style map (because they have the same map name). The mode will be ignored if a Challenge-mode map name is given. Abbreviations for modes is also supported (`speed and style` = `speed` = `sas` = `s&s` | `sprint` = `s`)\r\r**Example**\r`" + prefix + "dist bs s` or `" + prefix + "dist broken symmetry sprint`\rBoth would return the best time for Broken Symmetry in Sprint mode.");
							}
							else {
								mapid = CheckMapID.checkMapID(message, colors, results, jsondata, mapid);
								if (mapid === 0) {
									message.channel.sendMessage("Incorrect syntax.");
								}
								else if (typeof mapid === "string" && mapid !== "") {
									var optionsac = {
										hostname: "steamcommunity.com",
										path: "/stats/233610/leaderboards/" + mapid + "/?xml=1&start=1&end=1",
										method: "GET",
									};
									http.request(optionsac, function(response) {
										var str = "";
										response.on("data", function (chunk) {
											str += chunk;
										});
										response.on("end", function() {
											parseString(str, function(error, result) {
												if (error) {
													console.log(error);
												}
												else {
													var sometest = result.response.entries[0].entry[0].score;
													var somesteamid = result.response.entries[0].entry[0].steamid.toString();
													var working = parseInt(sometest.toString(), 10);
													var wrmin = ((working/1000)/60) >> 0;
													var wrsec = (working/1000)-(wrmin*60) >> 0;
													var wrmil = (working/1000).toFixed(3).split(".");
													wrmil = wrmil[1];
													if (wrsec < 10) {
														wrsec = "0" + wrsec;
													}
													//begin convert steamid64 to profile name
													var optionsac2 = {
														hostname: "steamcommunity.com",
														path: "/profiles/" + somesteamid + "/?xml=1",
														method: "GET",
													};
													http.request(optionsac2, function(response) {
														var str2 = "";
														response.on("data", function (chunk) {
															str2 += chunk;
														});
														response.on("end", function() {
															parseString(str2, function(error, result2) {
																if (error) {
																	console.log(error);
																}
																else {
																	var profilename = result2.profile.steamID.toString();
																	message.channel.sendMessage(wrmin + ":" + wrsec + "." + wrmil + " by " + profilename);
																}
															});
														});
													}).end();
												}
											});
										});
									}).end();
								}
								else {
									message.channel.sendMessage("No data found.");
								}
								hardCode[ref].timeout();
							}
						}
					});
				}



				else if (message.content.startsWith(prefix + "wr")) {
					hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							if (typeof results[1] === "string") {
								var str2 = message.content.toString();
								str2 = str2.substr(str2.indexOf(" ") + 1);
								str2 = str2.toLowerCase().split(" ");
								for (var i = 0; i < str2.length; i++) {
									str2[i] = str2[i].split("");
									str2[i][0] = str2[i][0].toUpperCase();
									str2[i] = str2[i].join("");
								}
								var category = str2.join(" ");
								var gamename = "";
								if (message.guild.name === "Cali Test Server") {
									gamename = "Antichamber";
								}
								else {
									gamename = message.guild.name;
								}
								var nonefound = true;
								var optionsac = {
									hostname: "www.speedrun.com",
									path: "/api_records.php?game=" + gamename,
									method: "GET",
									json:true
								};
								http.request(optionsac, function(response) {
									var str = "";
									response.on("data", function (chunk) {
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
														var wrmin = (working/60) >> 0;
														var wrsec = working-(wrmin*60) >> 0;
														var wrmil = working.toFixed(2).split(".");
														wrmil = wrmil[1];
														if (wrsec < 10) {
															wrsec = "0" + wrsec;
														}
														if (typeof actable[key].video !== "string") {
															message.channel.sendMessage(wrmin + ":" + wrsec + "." + wrmil + " by " + actable[key].player + ": No video found.");
															nonefound = false;
														}
														else {
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
							}
							else {
								message.channel.sendMessage("Incorrect syntax, category name required.");
							}
							hardCode[ref].timeout();
						}
					});
				}


				else if (message.content.startsWith(prefix + "ss")) {
					hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							currentss = timers.getCount();
							message.channel.sendMessage(currentss + " Use " + prefix + "speedy for full SS information.");
							hardCode[ref].timeout();
						}
					});
				}


				else if (message.content.startsWith(prefix + "advent")) {
					hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							if (results[1] === "set" && message.member.roles.exists("name", modrolename)) {
								if (typeof results[2] === "string") {
									if (typeof results[3] === "string") {
										eventName = null;
										eventDate = results[2];
										for (var i = 0; i < results.length; i++) {
											if (i === 3) {
												eventName = results[i];
											}
											else if (i > 3) {
												eventName = eventName + " " + results[i];
											}
										}
										message.channel.sendMessage("Event date set to: " + eventDate + "\nEvent name set to: " + eventName);
									}
									else {
										message.channel.sendMessage("Incorrect syntax.");
									}
								}
								else {
									message.channel.sendMessage("Syntax: __**`" + prefix + "advent set <date> <event name>`**__\rCreate an event countdown. Only one event at a time is supported.\r\r`date`\rThe date and time when the event begins. ISO8601 format with no spaces - use T instead of a space to denote the time. Times must be given in Eastern Time unless an offset is defined.\r\r`event name`\rThe name of the event.\r\r**Example**\r`" + prefix + "advent set 2016-02-08T13:30:20 Some Name`\rThis would set an event named `Some Name` to start at February 8th, 2016 at 1:30:20 PM.");
								}
							}
							else if (results[1] === "del" && message.member.roles.exists("name", modrolename)) {
								if (typeof eventDate === "string") {
									eventDate = null;
									message.channel.sendMessage("Event removed.");
								}
								else {
									message.channel.sendMessage("No event set.");
								}
							}
							else if (typeof results[1] !== "string" && eventDate !== null) {
								var currentstream = timers.getCountEvent(eventDate, eventName);
								message.channel.sendMessage(currentstream + "");
							}
							else {
								message.channel.sendMessage("No event set.");
							}
							hardCode[ref].timeout();
						}
					});
				}




				else if (message.content.startsWith(prefix + "speedy")) {
					hardCode[i].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							currentss = timers.getCount(message);
							message.author.sendMessage("Speedy Saturday is a community multiplayer get-together event that occurs every week (on Saturday) at 6:00PM UTC until 8:00PM UTC (2 hour duration). More information can be found here:\rhttp://steamcommunity.com/app/233610/discussions/0/528398719786414266/\rhttps://redd.it/3mlfje\r" + currentss);
							hardCode[ref].timeout();
						}
					});
				}



				else if (message.content.startsWith(prefix + "commands") || message.content.startsWith(prefix + "cmds") || message.content.startsWith(prefix + "help")) {
					hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							connection.query("SELECT commandname FROM commands WHERE server_id=" + message.guild.id + " order by commandname asc", function(error, quotes) {
								if (error) {
									message.channel.sendMessage("Failed to find any, with errors.");
									console.log(error);
									return;
								}
								else {
									var quotespm = "";
									if (typeof quotes[0] !== "object") {
										quotespm = "";
									}
									if (typeof quotes[0] === "object") {
										console.log(colors.red("Success."));
										quotespm = "`" + prefix;
										for (i = 0; i < quotes.length; i++) {
											if (i === quotes.length-1) {
												quotespm += quotes[i].commandname + "`";
											}
											else {
												quotespm += quotes[i].commandname + "`, `" + prefix;
											}
										}
										connection.query("SELECT comname FROM servcom WHERE server_id=" + message.guild.id, function(error, quotes2) {
											if (error) {
												message.channel.sendMessage("Failed to find any, with errors.");
												console.log(error);
												return;
											}
											else {
												var quotespm2 = "";
												if (typeof quotes2[0] !== "object") {
													quotespm2 = "";
												}
												else {
													console.log(colors.red("Success."));
													quotespm2 = "`" + prefix;
													for (i = 0; i < quotes2.length; i++) {
														if (!(i === quotes2.length-1)) {
															quotespm2 += quotes2[i].comname + "`, `" + prefix;
														}
														else {
															quotespm2 += quotes2[i].comname + "`";
														}
													}
													if (quotespm === "") {
														if (quotespm2) {
															message.author.sendMessage("No commands found for this server.");
														}
														else {
															message.author.sendMessage("Here are the main commands enabled for this server:\n" + quotespm);
														}
													}
													else if (quotespm2 === "") {
														message.author.sendMessage("Here are the custom commands for this server:\n" + quotespm2);
													}
													else {
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
					});
				}




				//setdelrole
				else if (message.content.startsWith(prefix + "setrole")) {
					hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							setDelRole.setRole(message, modrolename, membrolename, prefix, bot, toprole);
							hardCode[ref].timeout();
						}
					});
				}

				else if (message.content.startsWith(prefix + "delrole")) {
					hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							setDelRole.delRole(message, modrolename, membrolename, prefix, bot, toprole);
							hardCode[ref].timeout();
						}
					});
				}
				//end setdelrole







				//ripwin command
				else if (message.content.startsWith(prefix + "win") || message.content.startsWith(prefix + "rip")) {
					hardCode[ref].isEnabledForServer(message, connection, prefix).then((response) => {
						if (response && !hardCode[ref].onCooldown) {
							ripwin = results[0].replace(prefix, "");
							RipWin.ripWin(message, prefix, modrolename, colors, connection, bot, ripwin);
							hardCode[ref].timeout();
						}
					}).catch ((error) => console.error(error));
				}
				//end ripwin
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
bot.on("error", (e) => { console.error(e); });
bot.on("warn", (e) => { console.warn(e); });
bot.on("debug", (e) => { console.info(e); });




//discord login
bot.login(token);
