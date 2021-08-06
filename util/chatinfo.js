const logLocation = require("../config.json").loglocation;
const fs = require("fs-extra");
const colors = require("colors");
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
let ampm = "AM";

function messageDate(message) {
	const d = message.createdAt;

	let hournow = d.getHours();
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
	let minutenow = d.getMinutes();
	if (minutenow < 10) {
		minutenow = "0" + minutenow;
	}
	let secondnow = d.getSeconds();
	if (secondnow < 10) {
		secondnow = "0" + secondnow;
	}
	const day = d.getDate();
	const monthIndex = d.getMonth();
	const year = d.getFullYear();
	const thedate = monthNames[monthIndex] + " " + day + ", " + year + " " + hournow + ":" + minutenow + ":" + secondnow + " " + ampm;
	return {
		"formattedDate": thedate,
		year: "" + year,
		"month": monthNames[monthIndex],
		"hour": "" + hournow,
		"minute": "" + minutenow,
		ampm
	};
}

const getMaxRole = function(user) {
	let nick = null;
	let isbot = "";
	let toprole = "";
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

		let i = 0;
		const posEqI = val => val.position === i;
		let maxpos = 0;

		for (i; i < user.guild.roles.size + 1; i++) {
			maxpos = user.roles.cache.some(posEqI) && user.roles.cache.find(posEqI).position > maxpos ? user.roles.cache.find(posEqI).position : maxpos;
		}
		toprole = user.guild.roles.cache.find(val => val.position === maxpos);
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

const writeLineToAllLogs = function(bot, guild, line) {
	const guildChannels = guild.channels.cache.array();
	const currentDate = new Date();
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
	const currentYear = currentDate.getFullYear();
	const currentMonth = monthNames[currentDate.getMonth()];
	let i = 0;
	for (i; i < guildChannels.length; i++) {
		fs.mkdirsSync(`${logLocation}${guild.name}/#${guildChannels[i].name}/${currentYear}`, function(error) {
			if (error) {
				console.error(error.stack);
				return;
			}
		});
	}
	fs.mkdirsSync(`${logLocation}${guild.name}/full_logs`, function(error) {
		if (error) {
			console.error(error.stack);
			return;
		}
	});
	for (i; i < guildChannels.length; i++) {
		if (guildChannels[i].type === "text" && guildChannels[i].permissionsFor(guild.members.cache.get(bot.user.id)).permissions.has(["VIEW_CHANNEL", "SEND_MESSAGES"])) {
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

const formatChatlog = function(message) {
	const messageTime = messageDate(message);
	const messageContent = message.cleanContent.replace(/<(:[\w]+:)[\d]+>/g, "$1").replace(/(\r\n|\n|\r)/gm, " ");
	const member = message.member;
	const author = message.author;
	const isbot = (author.bot) ? "{BOT}" : "";
	//var user = getMaxRole(member);
	const chatlog = `${logLocation}${message.guild.name}/#${message.channel.name}/${messageTime.year}/${messageTime.month}.log`;
	const fullLog = `${logLocation}${message.guild.name}/full_logs/#${message.channel.name}.log`;
	let chatlinedata;
	let consoleChat;
	if (!member) {
		chatlinedata = `${messageTime.formattedDate} | ${isbot}(Guest)`;
		consoleChat = `${messageTime.hour}:${messageTime.minute} ${messageTime.ampm} [${message.guild.name}/#${message.channel.name}] ${isbot}(${(author.id === message.guild.owner.id)?"Owner":"Guest"})`;
	} else {
		chatlinedata = `${messageTime.formattedDate} | ${isbot}(${(member.roles.highest.name === "@everyone")?"Guest":member.roles.highest.name})`;
		consoleChat = `${messageTime.hour}:${messageTime.minute} ${messageTime.ampm} [${message.guild.name}/#${message.channel.name}] ${isbot}(${(member.roles.highest.name === "@everyone")?((member.id === message.guild.owner.id)?"Owner":"Guest"):member.roles.highest.name})`;
	}
	const att = [];
	let formattedAtturls = "";
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
	if (!member) {
		chatlinedata += `${author.username}: ${messageContent} `;
		consoleChat += `${author.username}: ${messageContent} `;
	} else {
		chatlinedata += `${member.displayName}: ${messageContent} `;
		consoleChat += `${member.displayName}: ${messageContent} `;
	}
	if (message.attachments.size > 0) {
		const attc = message.attachments.array();
		let i = 0;
		for (i; i < attc.length; i++) {
			att.push(attc[i].url);
		}
		i = 0;
		for (i; i < att.length; i++) {
			formattedAtturls += `${att[i]} `;
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
