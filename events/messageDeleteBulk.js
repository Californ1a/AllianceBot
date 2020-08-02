const {
	MessageEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = (bot, msgs) => {
	console.log(`${msgs.size} messages bulk deleted in guild \`${msgs.first().guild.name}\`.`);
	const conf = bot.servConf.get(msgs.first().guild.id);
	const logchan = conf.logchannel;
	if (!logchan) {
		return;
	}
	const logchanid = logchan.slice(2, logchan.length - 1);
	const chan = msgs.first().guild.channels.cache.get(logchanid);
	if (!chan) {
		return;
	}
	// const msgContents = [];
	let mainMsg = `**Action:** Bulk Message Delete\n**Channel:** ${msgs.first().channel}\n**Count:** ${msgs.size}\n\n**Content:**\n\n`;
	// const msgContent = msgs.reduce((acc, m) => ((acc + `${m.author}: ${m.content}\n`).length < 2000 ? acc + `${m.author}: ${m.content}\n` : ""), `**Action:** Bulk Message Delete\n**Channel:** ${msgs.first().channel}\n**Count:** ${msgs.size}\n**Content:**\n\n`);

	const maxLogMsgs = 3;
	msgs = msgs.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
	for (let i = 0; i < maxLogMsgs; i++) {
		msgs.each((m, key) => {
			const attachments = (m.attachments.first()) ? m.attachments.reduce((acc, a) => `${acc + a.url}\n`, " ") : "";
			const content = (m.content === "") ? "" : ` ${m.content}`;
			const line = `${m.author}:${content}${attachments}\n`;
			if ((mainMsg + line).length < 2000) {
				mainMsg += line;
				msgs.delete(key);
			}
		});
		if (mainMsg !== "") {
			const embed = new MessageEmbed()
				.setColor("#ffcc00")
				.setAuthor(bot.user.tag, bot.user.displayAvatarURL())
				.setDescription(mainMsg)
				.setTimestamp();
			send(chan, "", embed);
			mainMsg = "";
		}
	}

	// if (completeMsg.length >= 2000) {
	// 	const middle = Math.floor(completeMsg.length / 2);
	// 	const
	// }
	// const embed = new MessageEmbed()
	// 	.setColor("#ffcc00")
	// 	.setAuthor(bot.user.tag, bot.user.displayAvatarURL())
	// 	.setDescription(mainMsg)
	// 	.setTimestamp();
	// send(chan, "", embed);
};
