require("dotenv").config();
const pmx = require("pmx").init({
	http: true,
	ignore_routes: [/socket\.io/, /notFound/], // eslint-disable-line camelcase
	errors: true,
	custom_probes: true, // eslint-disable-line camelcase
	network: true,
	ports: true
});
//require("opbeat").start();
const connection = require("./util/connection.js");
const probe = pmx.probe();
const Discord = require("discord.js");
const bot = new Discord.Client();
bot.reminders = new Discord.Collection();
const botOwner = require("./config.json").ownerid;
const token = process.env.DISCORD_TOKEN;
const colors = require("colors");
const fs = require("fs-extra");
const moment = require("moment");
const reminders = require("./util/reminders.js");
const streams = require("./util/twitchStreams.js");
const events = require("events");
bot.confEventEmitter = new events.EventEmitter();
const Twit = require("twit");
const twitconfig = {
	consumer_key: process.env.TWITTER_CONSUMER_KEY, // eslint-disable-line camelcase
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET, // eslint-disable-line camelcase
	access_token: process.env.TWITTER_ACCESS_TOKEN, // eslint-disable-line camelcase
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET // eslint-disable-line camelcase
};
const T = new Twit(twitconfig);
const stream = T.stream("statuses/filter", {
	follow: ["628034104", "241371699"]
});
const meter = probe.meter({
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
		if (f !== "__tests__") {
			const props = require(`./commands/${f}`); // eslint-disable-line global-require
			log(`Loading Command: ${props.help.name}.`);
			bot.commands.set(props.help.name, props);
			if (props.f) {
				bot.commands.get(props.help.name).flags = new Discord.Collection();
				for (const key in props.f) {
					if (props.f.hasOwnProperty(key)) {
						bot.commands.get(props.help.name).flags.set(key, props.f[key]);
					}
				}
			}
			props.conf.aliases.forEach(alias => {
				bot.aliases.set(alias, props.help.name);
			});
		}
	});
});

//Command reload function
bot.reload = function(command) {
	return new Promise((resolve, reject) => {
		try {
			delete require.cache[require.resolve(`./commands/${command}`)];
			const cmd = require(`./commands/${command}`); // eslint-disable-line global-require
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

bot.timer = new Discord.Collection();
bot.timer.lockdown = new Discord.Collection();

let accum = 0;
let twitchChecked = false;

function streamCheck(a) {
	accum += a;
	if (accum >= 2) {
		// console.log("finishServConfLoad SideB");
		setTimeout(() => {
			bot.guilds.forEach(g => {
				// console.log(`Twitchcheck Guild ${g.id}`);
				const conf = bot.servConf.get(g.id);
				clearTimeout(conf.streamTimeout);
				conf.checkAmnt = 0;
				streams(bot, g);
				if (!twitchChecked) {
					console.log(colors.red("Started twitch stream checking."));
					twitchChecked = true;
				}
			});
			accum = 2;
		}, 1000);
	} else {
		setTimeout(() => {
			streamCheck(1);
		}, 5000);
	}
}

bot.confEventEmitter.on("finishServConfLoad", (a) => {
	streamCheck(a);
});

bot.servConf = new Discord.Collection();
bot.confRefresh = () => {
	return new Promise((resolve, reject) => {
		connection.select("*", "servers").then(serv => {
			let i = 0;
			for (i; i < serv.length; i++) {
				bot.servConf.set(serv[i].serverid, serv[i]);
			}
			//console.log(colors.cyan("servConf", bot.servConf));
			console.log(colors.red("Refreshed server configs"));
			bot.confEventEmitter.emit("finishServConfLoad", 1);
			// console.log("finishServConfLoad SideA");
			resolve();
		}).catch(e => reject(e));
	});
};
connection.createAllTables().then(() => {
	bot.confRefresh();
	reminders.refresh(bot);
	reminders.reminderEmitter(bot);
}).catch(console.error);

//Temporary quickfix just remove lockdown TODO: use db with proper remaining time in future
bot.channels.forEach(c => {
	if (c.locked && c.timeoutRoles) {
		const roles = c.timeoutRoles;
		for (const r of roles) {
			c.overwritePermissions(r, {
				"SEND_MESSAGES": null
			}, "Revert channel lockdown").catch(console.error);
		}
		c.locked = false;
		c.timeoutRoles = [];
	}
});

//get the permission level of the member who sent message
bot.elevation = function(msg) {
	if (!msg.guild) {
		if (msg.author.id === botOwner) {
			return 4;
		}
		return 1;
	}
	const conf = bot.servConf.get(msg.guild.id);
	const memberrole = conf.membrole;
	const moderatorrole = conf.modrole;
	const administratorrole = conf.adminrole;
	let permlvl = 0;
	if (msg.guild && msg.member) {
		if (memberrole) {
			const membRole = msg.guild.roles.find(val => val.name === memberrole);
			if (membRole && msg.member.roles.has(membRole.id)) {
				permlvl = 1;
			}
		}
		if (moderatorrole) {
			const modRole = msg.guild.roles.find(val => val.name === moderatorrole);
			if (modRole && msg.member.roles.has(modRole.id)) {
				permlvl = 2;
			}
		}
		if (administratorrole) {
			const adminRole = msg.guild.roles.find(val => val.name === administratorrole);
			if (adminRole && msg.member.roles.has(adminRole.id)) {
				permlvl = 3;
			}
		}
		if (msg.author.id === msg.guild.owner.id) {
			permlvl = 3;
		}
	}
	if (msg.author.id === botOwner) {
		permlvl = 4;
	}
	return permlvl;
};

//pm2 keymetrics meter for online suer count
probe.metric({
	name: "Online Users",
	value: () => {
		let total = 0;
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
	const err = new Error("This is an error.");
	pmx.notify(err);
	console.error(err);
	reply({
		success: false
	});
});


//catch errors
bot.on("error", (e) => {
	pmx.notify(new Error(e));
	if (e.message) {
		console.error(colors.green(e.message));
	} else {
		console.error(colors.green(e));
	}
});
bot.on("warn", (e) => {
	console.warn(colors.blue(e));
});
const regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
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
