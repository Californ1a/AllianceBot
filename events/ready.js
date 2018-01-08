const colors = require("colors");
const pre = require("../config.json").prefix;
const glitchNames = ["T͠h̷e̛ A҉ll̨i̡anc̵e", "T̕͝h̡͏e A͝l͏l̵i̡̛͡à̧̕n̨͜҉ce͞", "T͘̕͟h̵͟͡e͘͞ A̢͞l̀͡li̡̢͏̀a̶̕nc̶̢e", "ŦҤE λŁŁłλ₦₡E", "Ţђę Ąɭɭįąŋçę", "Ťhë ÅÎÎīåñċë", "Ṫḧḕ Ḁḷḷḭḁṅḉḕ", "T̷h̷e̴ ̶A̴l̶l̵i̷a̶n̵c̴e̸", "T̴͖̉h̶̾e̷̿͝ ̴̆̚A̴l̸l̶͂i̷an̶̂c̸͝e"];

var randomNickChange = function(bot) {
	var botMember = bot.guilds.get("83078957620002816").members.get(bot.user.id);
	var sec = Math.floor(Math.random() * 3600) + 1800;
	var ms = sec * 1000;
	var glitches = Math.floor(Math.random() * glitchNames.length);
	var rndmName = glitchNames[glitches];

	setTimeout(() => {
		console.log(glitches);
		console.log(rndmName.length);
		if (!botMember) {
			setTimeout(() => {
				randomNickChange(bot);
			}, ms);
		}
		botMember.setNickname(rndmName).then(bm => {
			console.log(colors.red(`Bot changed nick to ${rndmName}`));
			setTimeout(() => {
				bm.setNickname("").then(() => {
					console.log(colors.red("Bot nick reverted."));
					randomNickChange(bot);
				});
			}, 0);
		}).catch(e => {
			console.error(e);
			botMember.setNickname("").then(() => {
				console.log(colors.red("Bot nick reverted."));
				randomNickChange(bot);
			}).catch(e => console.error(`Double Catch!! ${e}`));
		});
	}, ms);
};

module.exports = bot => {
	console.log(colors.red(`Bot online and ready on ${bot.guilds.size} ${(bot.guilds.size >= 2) ? "servers" : "server"}.`));
	bot.user.setStatus("online").catch(e => console.error(e.stack));
	bot.user.setPresence({
		game: {
			name: `Distance | ${pre}help`,
			type: 0
		}
	}).catch(e => console.error(e.stack));
	if (bot.guilds.get("83078957620002816")) {
		randomNickChange(bot);
	}
};
