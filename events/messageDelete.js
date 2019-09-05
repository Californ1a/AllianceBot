const {
	RichEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = (bot, msg) => {
	console.log(`Message deleted: ${msg.content}`);
	if (msg.author.bot) {
		return;
	}
	const conf = bot.servConf.get(msg.guild.id);
	const logchan = conf.logchannel;
	if (!logchan) {
		return;
	}
	const logchanid = logchan.slice(2, logchan.length - 1);
	const chan = msg.guild.channels.get(logchanid);
	if (!chan) {
		return;
	}
	const embed = new RichEmbed()
		.setDescription(msg.content)
		.setAuthor(msg.member.displayName, msg.author.avatarURL);
	send(chan, "Message Deleted", embed);
};
