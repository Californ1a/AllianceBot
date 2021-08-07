const {
	MessageEmbed
} = require("discord.js");
const send = require("../util/sendMessage.js");

module.exports = (bot, msg) => {
	if (!msg.channel.guild) {
		if (msg.author && msg.content) {
			console.log(`Non-guild message deleted: ${msg.author}: ${msg.content}`);
		}
		return;
	}
	const conf = bot.servConf.get(msg.channel.guild.id);
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
	const chan = msg.channel.guild.channels.cache.get(logchanid);
	if (!chan) {
		return;
	}
	const attachments = (msg.attachments.first()) ? msg.attachments.reduce((acc, a) => `${acc + a.url}\n`, " ") : "";
	const content = (msg.content === "") ? "" : ` ${msg.content}`;
	const line = `${content}${attachments}\n`;
	const embed = new MessageEmbed()
		.setColor("#ffff00")
		.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL())
		.setDescription(`${msg.author}\n\n**Action:** Message Deleted\n**Channel:** ${msg.channel}\n**Content:**${line}`)
		.setTimestamp();
	send(chan, { content: "\u200b", embeds: [embed] });
};
