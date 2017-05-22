const connection = require("../util/connection.js");
const escape = require("../util/escapeChars.js");
const send = require("../util/sendMessage.js");

function update(flag, type, msg) {
	return new Promise((resolve, reject) => {
		var newFlag;
		if (flag) {
			newFlag = escape.chars(flag);
			if (newFlag !== flag) {
				reject(new Error("You used an invalid character."));
			}
			connection.update("servers", `${type}='${newFlag}'`, `serverid='${msg.guild.id}'`).then(() => {
				resolve();
			}).catch(console.error);
		}
	});
}

function doAll(flags, msg) {
	return new Promise((resolve, reject) => {
		var types = [];
		var newVals = [];
		for (var key in flags) {
			if (flags.hasOwnProperty(key)) {
				newVals.push(flags[key]);
				types.push(key);
				update(flags[key], key, msg).catch(e => {
					reject(e);
				});
			}
		}
		var ret = {
			types,
			newVals
		};
		resolve(ret);
	});
}

exports.run = (bot, msg, args, perms, cmd, flags) => {
	console.log("flags", flags);
	var conf = bot.servConf.get(msg.guild.id);
	if (!flags || !args[0]) {
		return send(msg.channel, `Incorrect syntax. Use \`${conf.prefix}help config\` for help.`);
	}
	doAll(flags, msg).then(ret => {
		var msgCon = [];
		var i = 0;
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
			}
		}
		bot.confRefresh().then(() => {
			send(msg.channel, `**Updated:**\n${msgCon.join("\n")}`);
		}).catch(e => {
			send(msg.channel, e.message);
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
	extendedDescription: "",
	usage: "config --<prefix|membrole|modrole|adminrole> (<prefix>|<member role>|<moderator role>|<admin role>)"
};

exports.f = {
	prefix: ["p", "pre"],
	membrole: ["memb", "membrole"],
	modrole: ["mod", "modrole"],
	adminrole: ["admin", "adminrole"]
};
