const connection = require("../util/connection.js");
const escape = require("../util/escapeChars.js");
const send = require("../util/sendMessage.js");

function update(flag, type, msg) {
	return new Promise((resolve, reject) => {
		let newFlag;
		if (flag) {
			newFlag = escape.chars(flag);
			if (newFlag !== flag) {
				reject(new Error("You used an invalid character."));
			}
			connection.update("servers", `${type}=${(newFlag.toLowerCase()==="null")?"NULL":`'${newFlag}'`}`, `serverid='${msg.channel.guild.id}'`).then(() => {
				resolve();
			}).catch(console.error);
		}
	});
}

function doAll(flags, msg) {
	return new Promise((resolve, reject) => {
		const types = [];
		const newVals = [];
		for (const key in flags) {
			if (Object.prototype.hasOwnProperty.call(flags, key)) {
				newVals.push(flags[key]);
				types.push(key);
				update(flags[key], key, msg).catch(e => {
					reject(e);
				});
			}
		}
		const ret = {
			types,
			newVals
		};
		resolve(ret);
	});
}

function createMsg(type, val) {
	let msgCon = "";
	switch (type) {
		case "prefix":
			msgCon = `Prefix - ${val}`;
			break;
		case "membrole":
			msgCon = `Member Role Name - ${val}`;
			break;
		case "modrole":
			msgCon = `Moderator Role Name - ${val}`;
			break;
		case "adminrole":
			msgCon = `Admin Role Name - ${val}`;
			break;
		case "logchannel":
			msgCon = `Log Channel - ${val}`;
			break;
		case "twitchchannel":
			msgCon = `Twitch Channel - ${val}`;
			break;
		case "twitchgame":
			msgCon = `Twitch Game - ${val}`;
			break;
	}
	return msgCon;
}

exports.run = (bot, msg, args, perms, cmd, flags) => {
	send(msg.channel, "Loading...").then(m => {
		const conf = bot.servConf.get(m.channel.guild.id);
		if (!flags || !args[0]) {
			return m.edit(`Incorrect syntax. Use \`${conf.prefix}help config\` for help.`);
		}
		doAll(flags, msg).then(ret => {
			const msgCon = [];
			let i = 0;
			for (i; i < ret.types.length; i++) {
				msgCon.push(createMsg(ret.types[i], ret.newVals[i]));
			}
			setTimeout(() => {
				bot.confRefresh().then(() => {
					m.edit(`**Updated:**\n${msgCon.join("\n")}`).catch(e => {
						console.log("B");
						console.error(e);
					});
				}).catch(e => {
					m.edit(e.message).catch(e => {
						console.log("C");
						console.error(e);
					});
				});
			}, 1000);
		});
	}).catch(e => {
		console.log("A");
		console.error(e);
	});
};

exports.runSlash = async (bot, interaction) => {
	if (!interaction.options.data[0]) {
		return interaction.reply({
			content: "You must select at least one option to change.",
			ephemeral: true
		});
	}
	try {
		await interaction.deferReply({
			ephemeral: true
		});
		const opts = interaction.options;
		const flags = {
			prefix: opts.getString("prefix"),
			membrole: `${opts.getRole("membrole")}`,
			modrole: `${opts.getRole("modrole")}`,
			adminrole: `${opts.getRole("adminrole")}`,
			logchannel: `${opts.getChannel("logchannel")}`,
			twitchchannel: `${opts.getChannel("twitchchannel")}`,
			twitchgame: opts.getString("twitchgame"),
			clear: opts.getString("clear")
		};
		const msgCon = [];
		for (const [key, value] of Object.entries(flags)) {
			if (value && value !== "null" && key !== "clear") {
				await update(value, key, interaction);
				msgCon.push(createMsg(key, value));
			} else if (value && value !== "null" && key === "clear") {
				await update("NULL", value, interaction);
				msgCon.push(createMsg(value, "NULL"));
			}
		}
		if (!msgCon[0]) {
			return interaction.editReply("You must select at least one option to change.");
		}
		setTimeout(async () => {
			try {
				await bot.confRefresh();
				await interaction.editReply(`**Updated:**\n${msgCon.join("\n")}`);
			} catch (e) {
				try {
					await interaction.editReply(e.message);
				} catch (e) {
					console.log("D");
					console.error(e);
				}
			}
		}, 1000);
	} catch (e) {
		console.log("E");
		console.error(e);
	}
};

exports.conf = {
	guildOnly: true,
	aliases: [],
	permLevel: 3,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "config",
	description: "Set server config",
	extendedDescription: "<prefix>\n* Command prefix to use in the server\n\n<membrole>\n* Name of the role to have perm level 1\n\n<modrole>\n* Name of the role to have perm level 2\n\n<adminrole>\n* Name of the role to have perm level 3\n\n<logchannel>\n* #Mention the channel to post logs to, or NULL to empty.\n\n<twitchchannel>\n* #Mention the channel to post twitch streams to, or NULL to empty.\n\n<twitchgame>\n* The exact name of the game as it is shown on Twitch, or NULL to empty.\n\n= Examples =\n\"config --prefix ~ --membrole Member --modrole Moderator --adminrole Admin\" :: This would set all of the config options, however, it is also possible to only edit need needed change:\n\n\"config --adminrole Admin\" :: This would only set the admin role.\n\n\"config --modrole Mod --prefix #\" :: This would set the prefix and moderator role.",
	usage: "config --<prefix|membrole|modrole|adminrole|logchannel|twitchchannel|twitchgame> [<prefix>|<member role>|<moderator role>|<admin role>|<log channel>|<twitch channel>|<twitch game>]"
};

exports.f = {
	prefix: ["p", "pre", "prefix"],
	membrole: ["memb", "membrole"],
	modrole: ["mod", "modrole"],
	adminrole: ["admin", "adminrole"],
	logchannel: ["lc", "logchannel"],
	twitchchannel: ["tc", "twitchchannel"],
	twitchgame: ["tg", "twitchgame"]
};

exports.slash = {
	name: "config",
	description: "Basic bot config",
	defaultPermission: false,
	options: [{
		name: "prefix",
		description: "Prefix used when typing commands in chat",
		type: "STRING"
	}, {
		name: "membrole",
		description: "'Member' role name, if one exists (for use in permissions)",
		type: "ROLE"
	}, {
		name: "modrole",
		description: "'Moderator' role name, if one exists (for use in permissions)",
		type: "ROLE"
	}, {
		name: "adminrole",
		description: "'Administrator' role name, if one exists (for use in permissions)",
		type: "ROLE"
	}, {
		name: "logchannel",
		description: "Channel to post logs to, if one exists",
		type: "CHANNEL"
	}, {
		name: "twitchchannel",
		description: "Channel to post twitch streams to, if one exists",
		type: "CHANNEL"
	}, {
		name: "twitchgame",
		description: "The game to search Twitch for streams of",
		type: "STRING"
	}, {
		name: "clear",
		description: "Pick a config option to clear",
		type: "STRING",
		choices: [{
			name: "membrole",
			value: "membrole"
		}, {
			name: "modrole",
			value: "modrole"
		}, {
			name: "adminrole",
			value: "adminrole"
		}, {
			name: "logchannel",
			value: "logchannel"
		}, {
			name: "twitchchannel",
			value: "twitchchannel"
		}, {
			name: "twitchgame",
			value: "twitchgame"
		}]
	}]
};
