const {
	RichEmbed
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
	const chan = msgs.first().guild.channels.get(logchanid);
	if (!chan) {
		return;
	}
	const embed = new RichEmbed()
		.setColor("#ffcc00")
		.setAuthor(bot.user.tag, bot.user.avatarURL)
		.setDescription(`**Action:** Bulk Message Delete\n**Channel:** ${msgs.first().channel}\n**Count:** ${msgs.size}`);
	send(chan, "", embed);
};
