require("dotenv").config();
const io = require("@pm2/io").init({
	http: true,
	ignore_routes: [/socket\.io/, /notFound/], // eslint-disable-line camelcase
	errors: true,
	custom_probes: true, // eslint-disable-line camelcase
	network: true,
	ports: true
});
//require("opbeat").start();
const connection = require("./util/connection.js");
const Discord = require("discord.js");
const bot = new Discord.Client({
	intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_EMOJIS_AND_STICKERS", "GUILD_PRESENCES", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
	partials: ["CHANNEL", "GUILD_MEMBER"]
});
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
let T, stream;
if (process.env.NODE_ENV !== "dev") {
	T = new Twit(twitconfig);
	stream = T.stream("statuses/filter", {
		follow: ["628034104", "241371699"]
	});
}
const meter = io.meter({
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
					if (Object.prototype.hasOwnProperty.call(props.f, key)) {
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
			bot.guilds.cache.forEach(g => {
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

bot.loadSlashCommands = async (guildid) => {
	try {
		console.log(colors.red("Loading slash commands"));
		let cmds, customCmds;
		if (guildid) {
			cmds = await connection.select("*", "commands", `server_id=${guildid}`);
			customCmds = await connection.select("*", "servcom", `server_id=${guildid}`);
		} else {
			cmds = await connection.select("*", "commands");
			customCmds = await connection.select("*", "servcom");
		}

		// console.log(cmds);
		const conf = [...bot.servConf.values()];
		for (const server of conf) {
			const {
				serverid
			} = server;
			const guild = bot.servConf.get(serverid);
			guild.cmds = {
				enabled: []
			};
			const matchingCmds = cmds.filter(c => c.server_id === serverid);
			for (const command of matchingCmds) {
				const {
					commandname
				} = command;
				// array of all enabled commands
				guild.cmds.enabled.push(commandname);
			}
			guild.cmds.disabled = [...bot.commands.keys()].filter(c => !guild.cmds.enabled.includes(c));
			// console.log(guild.commands.enabled, guild.commands.enabled);

			guild.customCmds = [];
			const matchingCustomCmds = customCmds.filter(c => c.server_id === serverid);
			for (const command of matchingCustomCmds) {
				if (command.type === "simple") {
					guild.customCmds.push({
						name: command.comname,
						description: `Custom command - ${command.type}`
					});
				} else if (command.type === "quote") {
					guild.customCmds.push({
						name: command.comname,
						description: `Custom command - ${command.type}`,
						options: [{
							name: "term",
							description: "Search term",
							type: "STRING"
						}, {
							name: "action",
							description: "Add, delete, or list quotes",
							type: "STRING",
							choices: [{
								name: "List",
								value: "list"
							}, {
								name: "Add",
								value: "add"
							}, {
								name: "Delete",
								value: "del"
							}]
						}]
					});
				}
			}
		}

		if (!bot.application?.owner) {
			await bot.application?.fetch();
		}
		// await bot.guilds.fetch();
		let guilds = bot.guilds.cache;
		if (guildid) {
			guilds = [bot.guilds.cache.get(guildid)];
		}
		guilds.forEach(async (g) => {
			const serv = bot.servConf.get(g.id);
			const commands = [...serv.cmds.enabled, ...serv.cmds.disabled];
			const slashCommands = [...serv.customCmds];
			for (const c of commands) {
				// console.log(c);
				const cmd = bot.commands.get(c);
				if (cmd?.slash) {
					if (cmd.conf.permLevel <= 1) {
						cmd.slash.defaultPermission = true; // temp
					}
					slashCommands.push(cmd.slash);
				}
			}

			await g.commands.set(slashCommands);

		});
		// console.log([...bot.servConf.values()]);
		console.log(colors.red("Loaded slash commands"));
	} catch (e) {
		console.error(e);
	}
};

connection.createAllTables().then(async () => {
	await bot.confRefresh();
	reminders.refresh(bot);
	reminders.reminderEmitter(bot);
}).catch(console.error);

//Temporary quickfix just remove lockdown TODO: use db with proper remaining time in future
bot.channels.cache.forEach(c => {
	if (c.locked && c.timeoutRoles) {
		const roles = c.timeoutRoles;
		for (const r of roles) {
			c.permissionOverwrites.edit(r, {
				"SEND_MESSAGES": null
			}, {
				reason: "Revert channel lockdown"
			}).catch(console.error);
		}
		c.locked = false;
		c.timeoutRoles = [];
	}
});

//get the permission level of the member who sent message
bot.elevation = async function(msg) {
	if (!msg.author) {
		// interaction command doesn't have author, just user
		msg.author = msg.user;
	}
	if (!msg.channel.guild) {
		if (msg.author.id === botOwner) {
			return 4;
		}
		return 1;
	}
	// if (msg.author.id === botOwner) {
	// 	return 4;
	// }
	const conf = bot.servConf.get(msg.channel.guild.id);
	const memberrole = conf.membrole;
	const moderatorrole = conf.modrole;
	const administratorrole = conf.adminrole;
	let permlvl = 0;
	if (msg.channel.guild && msg.member) {
		if (memberrole) {
			const membRole = msg.channel.guild.roles.cache.find(val => val.name === memberrole);
			if (membRole && msg.member.roles.cache.has(membRole.id)) {
				permlvl = 1;
			}
		}
		if (moderatorrole) {
			const modRole = msg.channel.guild.roles.cache.find(val => val.name === moderatorrole);
			if (modRole && msg.member.roles.cache.has(modRole.id)) {
				permlvl = 2;
			}
		}
		if (administratorrole) {
			const adminRole = msg.channel.guild.roles.cache.find(val => val.name === administratorrole);
			if (adminRole && msg.member.roles.cache.has(adminRole.id)) {
				permlvl = 3;
			}
		}
		const owner = await msg.channel.guild.fetchOwner();
		if (msg.author.id === owner.id) {
			permlvl = 3;
		}
	}
	if (msg.author.id === botOwner) {
		permlvl = 4;
	}
	return permlvl;
};

//pm2 keymetrics meter for online user count
io.metric({
	name: "Online Users",
	value: () => {
		let total = 0;
		bot.guilds.cache.forEach(g => {
			g.members.cache.forEach(m => {
				if (!m.bot && m.presence?.status.match(/^(online|idle|dnd)$/)) {
					total += 1;
				}
			});
		});
		return total;
	}
});

//pm2 keymetrics meter for heartbeat ping
io.metric({
	name: "Heartbeat Ping",
	value: () => {
		return Math.ceil(bot.ws.ping);
	}
});

//pmx manual throw error button
io.action("throw err", function(reply) {
	const err = new Error("This is an error.");
	io.notifyError(err);
	console.error(err);
	reply({
		success: false
	});
});


//catch errors
bot.on("error", (e) => {
	io.notifyError(new Error(e));
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
	io.notifyError(new Error("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason));
	console.error("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
	console.log("p.code", p.code);
	console.log("reason.code", reason.code);
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
