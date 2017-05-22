require("dotenv").config();
var pmx = require("pmx").init({
	http: true, // HTTP routes logging (default: true)
	ignore_routes: [/socket\.io/, /notFound/], // Ignore http routes with this pattern (Default: [])
	errors: true, // Exceptions loggin (default: true)
	custom_probes: true, // Auto expose JS Loop Latency and HTTP req/s as custom metrics
	network: true, // Network monitoring at the application level
	ports: true // Shows which ports your app is listening on (default: false)
});
require("opbeat").start();
//const sql = require("sqlite");
// var admin = require("firebase-admin");
// var serviceAccount = require("./serviceAccount.json");
// admin.initializeApp({
// 	credential: admin.credential.cert(serviceAccount),
// 	databaseURL: "https://alliancebot-e06ba.firebaseio.com/"
// });
// var db = admin.database();
const connection = require("./util/connection.js");
var probe = pmx.probe();
const Discord = require("discord.js");
const bot = new Discord.Client();
bot.reminders = new Discord.Collection();
const token = process.env.DISCORD_TOKEN;
const colors = require("colors");
const fs = require("fs-extra");
const moment = require("moment");
const reminders = require("./util/reminders.js");
//const config = require("./config.json");
const Twit = require("twit");
const twitconfig = {
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};
const T = new Twit(twitconfig);
const stream = T.stream("statuses/filter", {
	follow: ["628034104", "241371699"]
});
// const modrolename = config.modrolename;
// const membrolename = config.membrolename;
// const adminrolename = config.adminrolename;
var meter = probe.meter({
	name: "msg/min",
	samples: 60
});
require("./util/eventLoader.js")(bot, stream, meter);

const log = (msg) => {
	console.log(`[${moment().format("YYY-MM-DD HH:mm:ss")}] ${msg}`);
};
console.log(colors.red("Starting"));



//Create and load commands and aliases
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
		if (props.f) {
			bot.commands.get(props.help.name).flags = new Discord.Collection();
			for (var key in props.f) {
				if (props.f.hasOwnProperty(key)) {
					bot.commands.get(props.help.name).flags.set(key, props.f[key]);
				}
			}
		}
		props.conf.aliases.forEach(alias => {
			bot.aliases.set(alias, props.help.name);
		});
	});
});

//Command reload function
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

bot.servConf = new Discord.Collection();
bot.confRefresh = () => {
	return new Promise((resolve, reject) => {
		connection.select("*", "servers").then(serv => {
			var i = 0;
			for (i; i < serv.length; i++) {
				bot.servConf.set(serv[i].serverid, serv[i]);
			}
			//console.log(colors.cyan("servConf", bot.servConf));
			console.log(colors.red("Refreshed server configs"));
			resolve();
		}).catch(e => reject(e));
	});
};
connection.createAllTables().then(() => {
	bot.confRefresh();
	reminders.refresh(bot);
	reminders.reminderEmitter(bot);
}).catch(console.error);

//get the permission level of the member who sent message
bot.elevation = function(msg) {
	if (!msg.guild) {
		if (msg.author.id === require("./config.json").ownerid) {
			return 4;
		}
		return 0;
	}
	var conf = bot.servConf.get(msg.guild.id);
	var memberrole = conf.membrole;
	var moderatorrole = conf.modrole;
	var administratorrole = conf.adminrole;
	let permlvl = 0;
	if (msg.guild) {
		if (memberrole) {
			let membRole = msg.guild.roles.find("name", memberrole);
			if (membRole && msg.member.roles.has(membRole.id)) {
				permlvl = 1;
			}
		}
		if (moderatorrole) {
			let modRole = msg.guild.roles.find("name", moderatorrole);
			if (modRole && msg.member.roles.has(modRole.id)) {
				permlvl = 2;
			}
		}
		if (administratorrole) {
			let adminRole = msg.guild.roles.find("name", administratorrole);
			if (adminRole && msg.member.roles.has(adminRole.id)) {
				permlvl = 3;
			}
		}
	}
	if (msg.author.id === require("./config.json").ownerid) {
		permlvl = 4;
	}
	return permlvl;
};

//pm2 keymetrics meter for online suer count
probe.metric({
	name: "Online Users",
	value: () => {
		var total = 0;
		bot.users.forEach(u => {
			if (!u.bot && u.presence.status.match(/^(online|idle|dnd)$/)) {
				total += 1;
			}
		});
		return total;
	}
});

//pm2 keymetrics meter for heartbeat ping
probe.metric({
	name: "Heartbeat Ping",
	value: () => {
		return Math.ceil(bot.ping);
	}
});

//pmx manual throw error button
pmx.action("throw err", function(reply) {
	let err = new Error("This is an error.");
	pmx.notify(err);
	console.error(err);
	reply({
		success: false
	});
});


//catch errors
bot.on("error", (e) => {
	pmx.notify(new Error(e));
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
	pmx.notify(new Error("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason));
	console.error("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
	console.log(p.code);
	console.log(reason.code);
	if (p.code && p.code === "ETIMEDOUT") {
		process.exit();
	}
});

process.on("rejectionHandled", (p) => {
	console.log(`Handled Rejection: ${p}`);
	if (p.code && p.code === "ETIMEDOUT") {
		process.exit();
	}
});
