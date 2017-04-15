const connection = require("../util/connection.js");
const game = require("../util/game.js");
const sm = require("../util/scoremanager.js");

exports.run = (bot, msg, args, perm) => {
	var mentionedMember;
	if (!args[0]) {
		sm.getScore(msg.guild, msg.member).then(s => {
			msg.reply(`Your Rank: ${s.rank}, Your Score: ${s.score}`);
		}).catch(e => console.error(e.stack));
	} else if (args.length === 1 && msg.mentions.users.first()) {
		mentionedMember = msg.guild.members.get(msg.mentions.users.first().id);
		sm.getScore(msg.guild, mentionedMember).then(s => {
			if (mentionedMember.id === bot.user.id) {
				return msg.channel.sendMessage("Rank: Godlike, Score: Untouchable");
			}
			msg.channel.sendMessage(`Rank: ${s.rank}, Score: ${s.score}`);
		}).catch(e => console.error(e.stack));
	} else if (args[0] === "board" || args[0] === "b") {
		var limit = 9;
		if (perm >= 2 && (args[1] === "full" || args[1] === "f")) {
			limit = 999;
		}
		sm.getScore(msg.guild, msg.author).then(s => {
			game.getLB(msg.channel, `Your Rank: ${s.rank}, Your Score: ${s.score}`, limit);
		}).catch(e => console.error(e.stack));
		return;
	} else if (args.length === 3 && (args[0].match(/^(set|give)$/))) {
		if (perm < 2 && args[0] === "set") {
			return msg.channel.sendMessage("You do not have permission to set scores.");
		}
		if (!msg.mentions.users.first()) {
			return msg.channel.sendMessage("Incorrect syntax.");
		}
		if (perm < 2 && msg.mentions.users.first() === msg.author) {
			return msg.channel.sendMessage("You can't give points to yourself.");
		}
		if (isNaN(args[2])) {
			return msg.channel.sendMessage("The score must be a number.");
		}
		var amount = parseInt(args[2]);
		if (amount < 0 && perm < 2) {
			return msg.channel.sendMessage("The score must be positive.");
		}
		mentionedMember = msg.guild.members.get(msg.mentions.users.first().id);
		var type = (args[0] === "set") ? "set" : "add";
		sm.getScore(msg.guild, msg.member).then(s => {
			if (perm < 2 && s.score < amount) {
				return msg.channel.sendMessage("You do not have enough points to give away that many.");
			}
			if (amount > 0 && args[2].length > 9) {
				return msg.channel.sendMessage("The score can only be nine digits maximum.");
			}
			sm.setScore(msg.guild, mentionedMember, type, amount).then(m => {
				if (perm < 2) {
					sm.setScore(msg.guild, msg.member, type, amount * -1).then(r => {
						return msg.channel.sendMessage(`${msg.member.displayName}(${r.pScore}-->${r.score}) gave ${amount} points to ${mentionedMember.displayName}(${m.pScore}-->${m.score}).`);
					});
				} else {
					msg.channel.sendMessage(m.message);
				}
			}).catch(e => console.error(e.stack));
		}).catch(e => console.error(e.stack));
	} else if (args[0] === "clear") {
		if (!(perm >= 2)) {
			return msg.channel.sendMessage("You do not have permission to clear the leaderboards.");
		}
		msg.channel.sendMessage("Are you absolutely sure you want to completely clear the trivia leaderboards? y/n");
		msg.channel.awaitMessages(respond => (respond.author.id === msg.author.id && (respond.content === "yes" || respond.content === "no" || respond.content === "n" || respond.content === "y")), {
			max: 1,
			time: 10000,
			errors: ["time"],
		}).then((collected) => {
			if (collected.first().content === "no" || collected.first().content === "n") {
				return msg.channel.sendMessage("Boards remain intact.");
			}
			connection.del("triviascore", `server_id='${msg.guild.id}'`).then(() => {
				return msg.channel.sendMessage("Successfully cleared the trivia leaderboard.");
			}).catch(e => console.error(e.stack));
		}).catch(() => {
			return msg.channel.sendMessage("Did not reply in time. Boards left unchanged.");
		});
	} else {
		msg.channel.sendMessage("Incorrect syntax.");
	}
};

exports.conf = {
	guildOnly: false,
	aliases: ["s"],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "score",
	description: "Get your score/rank, other's score/rank, or set score.",
	extendedDescription: "",
	usage: "score [@mention|board(b)|set|give] [<@mention>] [<score>]"
};
