const Discord = require("discord.js");
const bot = new Discord.Client();
const token = require("./logins/discordtoken.json").token;
const colors = require("colors");
const fs = require("fs-extra");
const moment = require("moment");
const config = require("./config.json");
const twitconfig = require("./logins/twitconfig.js");
const Twit = require("twit");
const T = new Twit(twitconfig);
const stream = T.stream("statuses/filter", {
	follow: ["628034104", "241371699"]
});
const modrolename = config.modrolename;
const membrolename = config.membrolename;
const adminrolename = config.adminrolename;
require("./util/eventLoader.js")(bot, stream);

const log = (msg) => {
	console.log(`[${moment().format("YYY-MM-DD HH:mm:ss")}] ${msg}`);
};




bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
fs.readdir("./commands", (err, files) => {
	if (err) {
		console.error(err);
	}
	log(`Loading a total of ${files.length} commands.`);
	files.forEach(f => {
		let props = require(`./commands/${f}`);
		log(`Loading Command: ${props.help.name}.`);
		bot.commands.set(props.help.name, props);
		props.conf.aliases.forEach(alias => {
			bot.aliases.set(alias, props.help.name);
		});
	});
});

bot.reload = function(command) {
	return new Promise((resolve, reject) => {
		try {
			delete require.cache[require.resolve(`./commands/${command}`)];
			let cmd = require(`./commands/${command}`);
			bot.commands.delete(command);
			bot.aliases.forEach((cmd, alias) => {
				if (cmd === command) {
					bot.aliases.delete(alias);
				}
			});
			bot.commands.set(command, cmd);
			cmd.conf.aliases.forEach(alias => {
				bot.aliases.set(alias, cmd.help.name);
			});
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

bot.elevation = function(msg) {
	let permlvl = 0;
	if (msg.guild) {
		let membRole = msg.guild.roles.find("name", membrolename);
		if (membRole && msg.member.roles.has(membRole.id)) {
			permlvl = 1;
		}
		let modRole = msg.guild.roles.find("name", modrolename);
		if (modRole && msg.member.roles.has(modRole.id)) {
			permlvl = 2;
		}
		let adminRole = msg.guild.roles.find("name", adminrolename);
		if (adminRole && msg.member.roles.has(adminRole.id)) {
			permlvl = 3;
		}
	}
	if (msg.author.id === require("./config.json").ownerid) {
		permlvl = 4;
	}
	return permlvl;
};


//catch errors
bot.on("error", (e) => {
	console.error(colors.green(e));
});
bot.on("warn", (e) => {
	console.warn(colors.blue(e));
});
var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
bot.on("debug", (e) => {
	if (!e.toLowerCase().includes("heartbeat")) { //suppress heartbeat messages
		console.info(colors.yellow(e.replace(regToken, "[Redacted]")));
	}
});

bot.login(token);

process.on("unhandledRejection", (reason, p) => {
	console.error("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
});
