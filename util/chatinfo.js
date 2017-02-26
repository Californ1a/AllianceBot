const logLocation = require("../config.json").loglocation;
const fs = require("fs-extra");
const colors = require("colors");
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
var ampm = "AM";

function messageDate(message) {
	var d = message.createdAt;

	var hournow = d.getHours();
	ampm = "AM";
	if (hournow === 0) {
		hournow = 12;
		ampm = "AM";
	} else if (hournow >= 13) {
		hournow -= 12;
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
	var thedate = monthNames[monthIndex] + " " + day + ", " + year + " " + hournow + ":" + minutenow + ":" + secondnow + " " + ampm;
	return {
		"formattedDate": thedate,
		year,
		"month": monthNames[monthIndex],
		"hour": hournow,
		"minute": minutenow,
		ampm
	};
}

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
		var i = 0;
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

var writeLineToAllLogs = function(bot, guild, line) {
	var guildChannels = guild.channels.array();
	var currentDate = new Date();
	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
	var currentYear = currentDate.getFullYear();
	var currentMonth = monthNames[currentDate.getMonth()];
	var i = 0;
	for (i; i < guildChannels.length; i++) {
		if (guildChannels[i].type === "text" && guildChannels[i].permissionsFor(guild.members.get(bot.user.id)).hasPermissions(["READ_MESSAGES", "SEND_MESSAGES"])) {
			fs.appendFile(`${logLocation}${guild.name}/#${guildChannels[i].name}/${currentYear}/${currentMonth}.log`, `* ${line}\r\n`, function(error) {
				if (error) {
					console.error(error.stack);
				}
			});
			fs.appendFile(`${logLocation}${guild.name}/full_logs/#${guildChannels[i].name}.log`, `* ${line}\r\n`, function(error) {
				if (error) {
					console.error(error.stack);
				} else {
					//console.log(colors.white.dim("* " + line));
				}
			});
		}
	}
	if (line.includes("has come online") || line.includes("went offline")) {
		return;
	} else {
		console.log(colors.white.dim(`* ${line} on the '${guild.name}' server.`));
	}
};

var formatChatlog = function(message) {
	var messageTime = messageDate(message);
	var messageContent = message.cleanContent.replace(/<(:[\w]+:)[\d]+>/g, "$1").replace(/(\r\n|\n|\r)/gm, " ");
	var member = message.guild.members.get(message.author.id);
	var isbot = (member.user.bot)?"{BOT}":"";
	//var user = getMaxRole(member);
	var chatlog = `${logLocation}${message.guild.name}/#${message.channel.name}/${messageTime.year}/${messageTime.month}.log`;
	var fullLog = `${logLocation}${message.guild.name}/full_logs/#${message.channel.name}.log`;
	var chatlinedata = `${messageTime.formattedDate} | ${isbot}(${(member.highestRole.name === "@everyone")?"Guest":member.highestRole.name})`;
	var consoleChat = `${messageTime.hour}:${messageTime.minute} ${messageTime.ampm} [${message.guild.name}/#${message.channel.name}] ${isbot}(${(member.highestRole.name === "@everyone")?"Guest":member.highestRole.name})`;
	var att = [];
	var formattedAtturls = "";
	fs.mkdirsSync(`${logLocation}${message.guild.name}/#${message.channel.name}/${messageTime.year}`, function(error) {
		if (error) {
			console.error(error.stack);
			return;
		}
	});
	fs.mkdirsSync(`${logLocation}${message.guild.name}/full_logs`, function(error) {
		if (error) {
			console.error(error.stack);
			return;
		}
	});
	chatlinedata += `${member.displayName}: ${messageContent}`;
	consoleChat += `${member.displayName}: ${messageContent}`;
	if (message.attachments.size > 0) {
		var attc = message.attachments.array();
		var i = 0;
		for (i; i < attc.length; i++) {
			att.push(attc[i].url);
		}
		i = 0;
		for (i; i < att.length; i++) {
			formattedAtturls += ` ${att[i]}`;
		}
	}
	return {
		//user,
		messageTime,
		"currentLog": chatlog,
		fullLog,
		chatlinedata,
		consoleChat,
		"atturls": att,
		formattedAtturls
	};
};

module.exports = {
	formatChatlog,
	writeLineToAllLogs,
	getMaxRole
};
