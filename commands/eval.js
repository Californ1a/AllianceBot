const util = require("util");
const send = require("../util/sendMessage.js");

function clean(text) {
	if (typeof text === "string") {
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	} else {
		return text;
	}
}

async function mainEval(bot, msg, code, loc) {
	try {
		let evaled = eval(code);
		const type = typeof evaled;
		if (typeof evaled !== "string") {
			evaled = util.inspect(evaled);
		}
		const cleaned = clean(evaled);
		const m = `**EVAL:**\n\`\`\`js\n${code}\`\`\`\n**Evaluates to:**\n\`\`\`xl\n${cleaned}\`\`\`\n**Type:**\n\`\`\`fix\n${type}\`\`\``;
		try {
			if (msg.type === "APPLICATION_COMMAND") {
				msg.reply({
					content: m,
					ephemeral: true
				});
			} else {
				send(loc, m);
			}
		} catch (e) {
			let err = e.response.request.req.res;
			if (!err) {
				err = e.response;
				if (!err) {
					return console.error(e);
				}
			}
			const text = JSON.parse(err.text);
			const mErr = `**EVAL:**\`\`\`js\n${code}\`\`\`\n**Error:**\n\`\`\`js\n${err.statusCode} ${err.statusMessage}: ${text.content[0]}\`\`\``;
			if (msg.type === "APPLICATION_COMMAND") {
				msg.reply({
					content: mErr,
					ephemeral: true
				});
			} else {
				send(loc, mErr);
			}
		}
	} catch (err) {
		const mErr = `**EVAL:**\`\`\`js\n${code}\`\`\`\n**Error:**\n\`\`\`js\n${clean(err)}\`\`\``;
		if (msg.type === "APPLICATION_COMMAND") {
			msg.reply({
				content: mErr,
				ephemeral: true
			});
		} else {
			send(loc, mErr);
		}
	}
}

exports.run = async (bot, msg, args) => {
	const code = args.join(" ");
	await mainEval(bot, msg, code, msg.channel);
};

exports.runSlash = async (bot, interaction) => {
	// await interaction.deferReply({
	// 	ephmeral: true
	// });
	await mainEval(bot, interaction, interaction.options.getString("code"));
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

exports.slash = {
	name: "eval",
	description: "Evaluates code.",
	defaultPermission: false,
	options: [{
		name: "code",
		description: "The code to evaluate.",
		type: "STRING",
		required: true
	}]
};
