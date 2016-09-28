var md = require("./messagedate.js");
var fs = require("fs-extra");
var logLocation = require("../config/options.json").logLocation;
var prefix = require("../config/options.json").prefix;
var i = 0;

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
	}
	else {
    //console.log(user.bot);
		if (user.user.bot) {
			isbot = "{BOT}";
		}
		var maxpos = 0;
    i = 0;
		for (i; i < user.guild.roles.size+1; i++) {
			maxpos = user.roles.exists("position",i) && user.roles.find("position",i).position > maxpos ? user.roles.find("position",i).position : maxpos;
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
	var messageContent = message.cleanContent.replace(/<(:[\w]+:)[\d]+>/g, "$1");
	var user = getMaxRole(message.guild.members.get(message.author.id));
	var chatlog = logLocation + message.guild.name + "/" + message.channel.name + "/" + messageTime.year + "/" + messageTime.month + ".txt";
	var chatlinedata = messageTime.formattedDate + " | " + user.isbot + "(" + user.toprole.name + ")";
	var consoleChat = messageTime.hour + ":" + messageTime.minute + messageTime.ampm + " [" + message.guild.name + "/#" + message.channel.name + "] " + user.isbot + "(" + user.toprole.name + ")";
	var att = [];
	var formattedAtturls = "";
	fs.mkdirsSync(logLocation + message.guild.name + "/" + message.channel.name + "/" + messageTime.year, function(error) {
		if (error) {
			console.log(error);
			return;
		}
	});
  //console.log(message.member);
	if (message.member.nickname) {
		chatlinedata += message.member.nickname + ": " + messageContent;
		consoleChat += message.member.nickname + ": " + messageContent;
	}
	else {
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
			formattedAtturls += "\r\n" + att[i];
		}
	}
	return {
		user,
		"currentLog": chatlog,
		chatlinedata,
		consoleChat,
		"atturls": att,
		formattedAtturls
	};
};

var escapeChars = function(word) {
  var escapechars = true;
  var tempWord = word;
  while (escapechars) {
    if (tempWord.includes("\'") && !tempWord.includes("\\\'")) {
      tempWord = tempWord.replace("\'", "\\\'", "g");
    }
    else if (tempWord.includes("\"") && !tempWord.includes("\\\"")) {
      tempWord = tempWord.replace("\"", "\\\"", "g");
    }
    else if (tempWord.includes("\\") && !tempWord.includes("\\\\")) {
      tempWord = tempWord.replace("\\", "\\\\", "g");
    }
    else if (tempWord.includes("\%") && !tempWord.includes("\\\%")) {
      tempWord = tempWord.replace("\%", "\\\%", "g");
    }
    else if (tempWord.includes("\_") && !tempWord.includes("\\\_")) {
      tempWord = tempWord.replace("\_", "\\\_", "g");
    }
    else {
      escapechars = false;
    }
  }
  return tempWord;
};

var getComRef = function(hardCode, results) {
	var ref = 0;
	i = 0;
  for (i; i < hardCode.length; i++) {
    if (hardCode[i].name === results[0].replace(prefix,"")) {
      ref = i;
    }
  }
	return ref;
};

module.exports = {
  formatChatlog,
  getMaxRole,
  escapeChars,
	getComRef
};
