const connection = require("../util/connection.js");
const colors = require("colors");
//var config;
const escape = require("../util/escapeChars.js");
const send = require("../util/sendMessage.js");
//const pre = config.prefix;
// const modrolename = config.modrolename;
// const membrolename = config.membrolename;
// const adminrolename = config.adminrolename;


exports.run = (bot, msg, args, perms, cmd, flags) => {
	// const config = bot.servConf;
	// const pre = config.prefix;

	//checks for all the right flags to be assigned values by user
	if (!flags) {
		return send(msg.channel, "You must specify flags.");
	} else if (!flags.type) {
		return send(msg.channel, "You must specify a type.");
	} else if (!flags.name) {
		return send(msg.channel, "You must specify a name.");
	} else if (flags.name.includes(" ")) {
		return send(msg.channel, "The name cannot have any spaces.");
	} else if (!flags.type.match(/^(simple|quote)$/)) {
		return send(msg.channel, "The command type must be `simple` or `quote`.");
	} else if (flags.inpm && !flags.inpm.match(/^(true|false)$/)) {
		return send(msg.channel, "The inpm must be `true` or `false`.");
	} else if (flags.type === "simple" && !flags.message) {
		return send(msg.channel, "You must specify a message for simple-type commands.");
	}


	const cmdname = escape.chars(flags.name);
	if (cmdname !== flags.name) {
		return send(msg.channel, "Invalid characters used in command name.");
	}
	connection.select("*", "servcom", `server_id='${msg.guild.id}' AND comname='${cmdname}'`).then(r => {
		if (r[0]) {
			return send(msg.channel, "This command already exists.");
		}
		//assign variables from flags
		const type = flags.type;
		let permslvl = 0;
		if (flags.permlvl) {
			permslvl = flags.permlvl;
		}
		let inpms = "false";
		if (flags.inpm) {
			inpms = flags.inpm;
		}
		let fullmsg;
		//var escdMsg;
		if (flags.message) {
			fullmsg = flags.message;
			//escdMsg = escape.chars(fullmsg);
		}
		let info;
		if (type === "simple") {
			info = {
				comname: cmdname,
				comtext: `'${fullmsg}'`,
				permlvl: permslvl,
				inpm: inpms,
				"server_id": msg.guild.id
			};
		} else if (type === "quote") {
			info = {
				comname: cmdname,
				type,
				permlvl: permslvl,
				inpm: inpms,
				"server_id": msg.guild.id
			};
		}

		console.log(colors.red(`Attempting to add the command \`${cmdname}\` to server \`${msg.guild.name}\`.`));
		// var info = {
		// 	"comname": cmdname,
		// 	"comtext": `'${escdMsg}'`,
		// 	"permlvl": permslvl,
		// 	"inpm": inpms,
		// 	"server_id": msg.guild.id
		// };
		connection.insert("servcom", info).then(() => {
			if (type === "quote") {
				const tableNames = ["advent", "commands", "giveaway", "giveusers", "playtest", "reminders", "servcom", "servers", "timeout", "triviascore"];
				if (tableNames.includes(cmdname)) {
					return send(msg.channel, "Invalid custom command name.");
				}
				console.log(colors.red(`Attempting to create table \`${cmdname}\` if not already existing...`));
				connection.query(`CREATE TABLE IF NOT EXISTS ${cmdname} (id${cmdname} INT(11) NOT NULL AUTO_INCREMENT, quote VARCHAR(255) NOT NULL, server_id VARCHAR(45) NOT NULL, PRIMARY KEY (id${cmdname}), UNIQUE INDEX id_${cmdname}_unique (quote, server_id), INDEX ${cmdname}_ibfk_1 (server_id), CONSTRAINT ${cmdname}_ibfk_1 FOREIGN KEY (server_id) REFERENCES servers (serverid) ON UPDATE NO ACTION ON DELETE CASCADE) COLLATE='utf8mb4_general_ci' ENGINE=InnoDB`).then(() => {
					console.log(colors.red("Table existed or was successfully created."));
				}).catch(e => {
					send(msg.channel, "Failed");
					console.error(e);
					return;
				});
			}
			console.log(colors.red("Successfully inserted command."));
			send(msg.channel, "Success");
		}).catch(e => {
			send(msg.channel, "Failed");
			console.error(e);
			return;
		});
	});
};

exports.conf = {
	guildOnly: true,
	aliases: ["nc"],
	permLevel: 2,
	onCooldown: false,
	cooldownTimer: 5000
};

exports.help = {
	name: "newcom",
	description: "Create a simple custom command.",
	extendedDescription: "<command-name>\n* Name of command without prefix\n\n<type>\n* 'simple' or 'quote' - \n\n<perm-level> (0-3)\n* 0 is @everyone, 1 is Members, 2 is Moderators, 3 is Admins\n\n<reply-in-pm> (true|false)\n* Reply to command in a PM rather than in-channel.\n\n<message>\n* The message to be sent when command is given. Do not specify for quote-type.\n\n= Examples =\n\"newcom --n spook --type simple --permlvl 0 --pm false --m BOO! Scared ya!\" :: The new command would be \"spook\" (enabled for all members and would reply in-channel) and the returned message would be \"BOO! Scared ya!\"\n\"newcom --n rip --type quote --permlvl 0 --pm false\" :: The \"rip\" command would now be a quote-type command where anyone with perm 2+ can add/remove quotes via \"rip add/del <quote>\" and anyone perm 0+ can use \"rip\" or \"rip <search term>\" to get a quote from the list of added quotes.",
	usage: "newcom --name <command name> --type <type> --permlvl <perm level> --inpm <reply in pm> --message <message>"
};

exports.f = {
	name: ["n", "name"],
	permlvl: ["permlvl", "perm", "p", "pl", "lvl", "l"],
	inpm: ["inpm", "pm"],
	type: ["t", "type"],
	message: ["msg", "message", "m"]
};
