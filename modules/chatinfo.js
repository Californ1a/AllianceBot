const md = require("./messagedate.js");
const fs = require("fs-extra");
const logLocation = require("../config/options.json").logLocation;
const prefix = require("../config/options.json").prefix;
const colors = require("colors");
var i = 0;

function formatUptime(amount) {
	var out = "Bot uptime: ";
	var days = 0;
	var hours = 0;
	var mins = 0;
	var secs = 0;

	amount = Math.floor(amount);
	days = Math.floor(amount / 86400); //days
	amount %= 86400;
	hours = Math.floor(amount / 3600); //hours
	amount %= 3600;
	mins = Math.floor(amount / 60); //minutes
	amount %= 60;
	secs = Math.floor(amount); //seconds

	if (days !== 0) {
		out += days + " day" + ((days !== 1) ? "s" : "") + ", ";
	}
	if (days !== 0 || hours !== 0) {
		out += hours + " hour" + ((hours !== 1) ? "s" : "") + ", ";
	}
	if (days !== 0 || hours !== 0 || mins !== 0) {
		out += mins + " minute" + ((mins !== 1) ? "s" : "") + ", ";
	}
	out += secs + " seconds.";
	return out;

}

var writeLineToAllLogs = function(bot, guild, line) {
	var guildChannels = guild.channels.array();
	var currentDate = new Date();
	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
	var currentYear = currentDate.getFullYear();
	var currentMonth = monthNames[currentDate.getMonth()];
	i = 0;
	for (i; i < guildChannels.length; i++) {
		//fs.appendFile("channelperms.json", util.inspect(guildChannels[i].permissionsFor(guild.members.get(bot.user.id)).serialize()) + "\r\n\r\n");
		if (guildChannels[i].type === "text" && guildChannels[i].permissionsFor(guild.members.get(bot.user.id)).hasPermissions(["READ_MESSAGES", "SEND_MESSAGES"])) {
			fs.appendFile(logLocation + guild.name + "/#" + guildChannels[i].name + "/" + currentYear + "/" + currentMonth + ".log", "* " + line + "\r\n", function(error) {
				if (error) {
					console.error(error);
				}
			});
			fs.appendFile(logLocation + guild.name + "/full_logs/#" + guildChannels[i].name + ".log", "* " + line + "\r\n", function(error) {
				if (error) {
					console.error(error);
				} else {
					//console.log(colors.white.dim("* " + line));
				}
			});
		}
	}
	if (line.includes("has come online") || line.includes("went offline")) {
		return;
	} else {
		console.log(colors.white.dim("* " + line + " on the '" + guild.name + "' server."));
	}
};

var getDisplayName = function(guildMember) {
	if (guildMember) {
		if (guildMember.nickname) {
			return guildMember.nickname;
		} else {
			return guildMember.user.username;
		}
	} else {
		return guildMember.user.username;
	}
};

var getMaxRole = function(user) {
	var nick = null;
	var isbot = "";
	var toprole = "";
	//console.log(user.roles);
	if (user.roles.size === 1) {
		//user = "Guest";
		//console.log(user.roles.find("name","@everyone").position);
		toprole = {
			"position": 0,
			"name": "Guest"
		};
		if (user.user.bot) {
			isbot = "{BOT}";
		}
	} else {
		//console.log(user.bot);
		if (user.user.bot) {
			isbot = "{BOT}";
		}
		var maxpos = 0;
		i = 0;
		for (i; i < user.guild.roles.size + 1; i++) {
			maxpos = user.roles.exists("position", i) && user.roles.find("position", i).position > maxpos ? user.roles.find("position", i).position : maxpos;
		}
		toprole = user.guild.roles.find("position", maxpos);
		if (user.nickname) {
			nick = user.nickname;
		}
	}
	return {
		toprole,
		isbot,
		nick
	};
};

var formatChatlog = function(message) {
	var messageTime = md.messageDate(message);
	var messageContent = message.cleanContent.replace(/<(:[\w]+:)[\d]+>/g, "$1").replace(/(\r\n|\n|\r)/gm, " ");
	var user = getMaxRole(message.guild.members.get(message.author.id));
	var chatlog = logLocation + message.guild.name + "/#" + message.channel.name + "/" + messageTime.year + "/" + messageTime.month + ".log";
	var fullLog = logLocation + message.guild.name + "/full_logs/#" + message.channel.name + ".log";
	var chatlinedata = messageTime.formattedDate + " | " + user.isbot + "(" + user.toprole.name + ")";
	var consoleChat = messageTime.hour + ":" + messageTime.minute + " " + messageTime.ampm + " [" + message.guild.name + "/#" + message.channel.name + "] " + user.isbot + "(" + user.toprole.name + ")";
	var att = [];
	var formattedAtturls = "";
	fs.mkdirsSync(logLocation + message.guild.name + "/#" + message.channel.name + "/" + messageTime.year, function(error) {
		if (error) {
			console.error(error);
			return;
		}
	});
	//console.log(message.member);
	if (message.member.nickname) {
		chatlinedata += message.member.nickname + ": " + messageContent;
		consoleChat += message.member.nickname + ": " + messageContent;
	} else {
		chatlinedata += message.author.username + ": " + messageContent;
		consoleChat += message.author.username + ": " + messageContent;
	}
	if (message.attachments.size > 0) {
		var attc = message.attachments.array();
		i = 0;
		for (i; i < attc.length; i++) {
			att.push(attc[i].url);
		}
		i = 0;
		for (i; i < att.length; i++) {
			formattedAtturls += " " + att[i];
		}
	}
	return {
		user,
		messageTime,
		"currentLog": chatlog,
		fullLog,
		chatlinedata,
		consoleChat,
		"atturls": att,
		formattedAtturls
	};
};

var specials = ["-", "[", "]", "/", "{", "}", "(", ")", "*", "+", "'", "?", ".", "\\", "^", "$", "|"];
var regex = RegExp("[" + specials.join("\\") + "]", "g");
var escapeChars = function(str) {
	// var escapechars = true;
	// var tempWord = word;
	// while (escapechars) {
	// 	if (tempWord.includes("\'") && !tempWord.includes("\\\'")) {
	// 		tempWord = tempWord.replace("\'", "\\\'", "g");
	// 	} else if (tempWord.includes("\"") && !tempWord.includes("\\\"")) {
	// 		tempWord = tempWord.replace("\"", "\\\"", "g");
	// 	} else if (tempWord.includes("\\") && !tempWord.includes("\\\\")) {
	// 		tempWord = tempWord.replace("\\", "\\\\", "g");
	// 	} else if (tempWord.includes("\%") && !tempWord.includes("\\\%")) {
	// 		tempWord = tempWord.replace("\%", "\\\%", "g");
	// 	} else if (tempWord.includes("\_") && !tempWord.includes("\\\_")) {
	// 		tempWord = tempWord.replace("\_", "\\\_", "g");
	// 	} else {
	// 		escapechars = false;
	// 	}
	// }
	// return tempWord;
	//console.log(str);
	return str.replace(regex, "\\$&");
};


var getComRef = function(hardCode, results) {
	var ref = 0;
	i = 0;
	for (i; i < hardCode.length; i++) {
		if (hardCode[i].name === results[0].replace(prefix, "")) {
			ref = i;
		}
	}
	return ref;
};

module.exports = {
	formatChatlog,
	getMaxRole,
	escapeChars,
	getComRef,
	writeLineToAllLogs,
	getDisplayName,
	formatUptime
};
