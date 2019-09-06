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
			connection.update("servers", `${type}=${(newFlag.toLowerCase()==="null")?"NULL":`'${newFlag}'`}`, `serverid='${msg.guild.id}'`).then(() => {
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
			if (flags.hasOwnProperty(key)) {
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

exports.run = (bot, msg, args, perms, cmd, flags) => {
	send(msg.channel, "Loading...").then(m => {
		const conf = bot.servConf.get(m.guild.id);
		if (!flags || !args[0]) {
			return m.edit(`Incorrect syntax. Use \`${conf.prefix}help config\` for help.`);
		}
		doAll(flags, msg).then(ret => {
			const msgCon = [];
			let i = 0;
			for (i; i < ret.types.length; i++) {
				switch (ret.types[i]) {
					case "prefix":
						msgCon.push(`Prefix - ${ret.newVals[i]}`);
						break;
					case "membrole":
						msgCon.push(`Member Role Name - ${ret.newVals[i]}`);
						break;
					case "modrole":
						msgCon.push(`Moderator Role Name - ${ret.newVals[i]}`);
						break;
					case "adminrole":
						msgCon.push(`Admin Role Name - ${ret.newVals[i]}`);
						break;
					case "logchannel":
						msgCon.push(`Log Channel - ${ret.newVals[i]}`);
						break;
				}
			}
			setTimeout(() => {
				bot.confRefresh().then(() => {
					m.edit(`**Updated:**\n${msgCon.join("\n")}`);
				}).catch(e => {
					m.edit(e.message);
				});
			}, 1000);
		});
	});
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
	extendedDescription: "<prefix>\n* Command prefix to use in the server\n\n<membrole>\n* Name of the role to have perm level 1\n\n<modrole>\n* Name of the role to have perm level 2\n\n<adminrole>\n* Name of the role to have perm level 3\n\n<logchannel>\n* ID of the channel to post logs to.\n\n= Examples =\n\"config --prefix ~ --membrole Member --modrole Moderator --adminrole Admin\" :: This would set all of the config options, however, it is also possible to only edit need needed change:\n\n\"config --adminrole Admin\" :: This would only set the admin role.\n\n\"config --modrole Mod --prefix #\" :: This would set the prefix and moderator role.",
	usage: "config --<prefix|membrole|modrole|adminrole|logchannel> [<prefix>|<member role>|<moderator role>|<admin role>|<log channel>]"
};

exports.f = {
	prefix: ["p", "pre", "prefix"],
	membrole: ["memb", "membrole"],
	modrole: ["mod", "modrole"],
	adminrole: ["admin", "adminrole"],
	logchannel: ["lc", "logchannel"]
};
