const {
	RichEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = (bot, msg) => {
	const conf = bot.servConf.get(msg.guild.id);
	const tc = conf.twitchchannel;
	if (tc && conf.twitchgame && msg.channel.id === tc.slice(2, tc.length - 1)) {
		return;
	}
	console.log(`Message deleted: ${msg.content}`);
	if (msg.author.bot) {
		return;
	}
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
