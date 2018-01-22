const send = require("../util/sendMessage.js");

function clean(text) {
	if (typeof text === "string") {
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	} else {
		return text;
	}
}

exports.run = (bot, msg, args) => {
	let code = args.join(" ");
	try {
		let evaled = eval(code);
		let type = typeof evaled;
		if (typeof evaled !== "string") {
			evaled = require("util").inspect(evaled);
		}
		let cleaned = clean(evaled);
		send(msg.channel, `**EVAL:**\n\`\`\`js\n${code}\`\`\`\n**Evaluates to:**\n\`\`\`xl\n${cleaned}\`\`\`\n**Type:**\n\`\`\`fix\n${type}\`\`\``).catch(e => {
			let err = e.response.request.req.res;
			if (!err) {
				err = e.response;
				if (!err) {
					return console.error(e);
				}
			}
			let text = JSON.parse(err.text);
			send(msg.channel, `**EVAL:**\`\`\`js\n${code}\`\`\`\n**Error:**\n\`\`\`js\n${err.statusCode} ${err.statusMessage}: ${text.content[0]}\`\`\``);
		});
	} catch (err) {
		send(msg.channel, `**EVAL:**\`\`\`js\n${code}\`\`\`\n**Error:**\n\`\`\`js\n${clean(err)}\`\`\``);
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
