function clean(text) {
	if (typeof text === "string") {
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	} else {
		return text;
	}
}

exports.run = (bot, msg, args) => {
	try {
		var code = args.join(" ");
		var evaled = eval(code);

		if (typeof evaled !== "string") {
			evaled = require("util").inspect(evaled);
		}
		msg.channel.sendCode("xl", clean(evaled));
	} catch (err) {
		msg.channel.sendMessage(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
	}
};

exports.conf = {
	guildOnly: false,
	aliases: [],
	permLevel: 4,
	onCooldown: false,
	cooldownTimer: 0
};

exports.help = {
	name: "eval",
	description: "eval",
	extendedDescription: "",
	usage: "eval <code>"
};
