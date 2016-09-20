var md = require("./messagedate.js");
var fs = require("fs-extra");
var logLocation = "E:/OtherStuff/DiscordChatlogs2/";

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
		for (var i = 0; i < user.guild.roles.size+1; i++) {
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
		chatlinedata += message.member.nickname + ": " + message.cleanContent;
		consoleChat += message.member.nickname + ": " + message.cleanContent;
	}
	else {
		chatlinedata += message.author.username + ": " + message.cleanContent;
		consoleChat += message.author.username + ": " + message.cleanContent;
	}
	if (message.attachments.size > 0) {
		var attc = message.attachments.array();
		for (var i = 0; i < attc.length; i++) {
			att.push(attc[i].url);
		}
		for (var i = 0; i < att.length; i++) {
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

module.exports = {
  formatChatlog,
  getMaxRole
};
