const colors = require("colors");
const connection = require("./connection.js");
const send = require("./sendMessage.js");
const {
	MessageEmbed
} = require("discord.js");

function sendLogChannelMessage(bot, member) {
	const conf = bot.servConf.get(member.guild.id);
	const logchan = conf.logchannel;
	if (!logchan) {
		return;
	}

	const logchanid = logchan.slice(2, logchan.length - 1);
	const chan = member.guild.channels.cache.get(logchanid);
	if (!chan) {
		return;
	}
	const embed = new MessageEmbed()
		.setColor("#f4bf42")
		.setAuthor({
			name: `${member.user.tag} (${member.user.id})`,
			iconURL: member.user.displayAvatarURL()
		})
		.setFooter({
			text: "Timeout ended"
		});
	send(chan, {
		content: "\u200b",
		embeds: [embed]
	});
}

function manageTimeout(mentionedMember, bot, toRole, guildid, optionalMembID) {
	const guild = bot.guilds.cache.get(guildid);
	if (mentionedMember) {
		if (guild.members.cache.get(mentionedMember.id)) {
			mentionedMember.roles.remove(toRole).catch(e => console.error(e.stack));
			console.log(colors.red(`${mentionedMember.displayName} removed from timeout.`));
			sendLogChannelMessage(bot, mentionedMember);
		} else {
			console.log(colors.red(`When attempting to remove Timeout role, ${mentionedMember.displayName} could not be found.`));
		}
	} else {
		console.log(colors.red("When attempting to remove Timeout role, the member could not be found on the server anymore."));
	}
	optionalMembID = (optionalMembID) ? optionalMembID : mentionedMember.id;
	connection.del("timeout", `memberid=${optionalMembID} AND server_id=${guild.id}`).catch(console.error);
}

module.exports = manageTimeout;
