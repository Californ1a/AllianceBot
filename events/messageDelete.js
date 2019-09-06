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
		.setColor("#ffff00")
		.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.avatarURL)
		.setDescription(`**Action:** Message Deleted\n**Channel:** ${msg.channel}\n**Content:** ${msg.content}`);
	send(chan, "", embed);
};
