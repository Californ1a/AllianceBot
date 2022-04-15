const colors = require("colors");
const connection = require("../util/connection.js");
const customQuotes = require("../util/customQuotes.js").ripWin;

function getOpts(options) {
	const arr = [];
	const recurseOpts = (opt) => {
		if (!opt.type.match(/^(sub_command|sub_command_group)$/i)) {
			return {
				[opt.name]: opt.value
			};
		}
		arr.push(opt.name);
		return {
			[opt.name]: opt.options.map(recurseOpts)
		};
	};
	const opts = options.map(recurseOpts).reduce((acc, obj) => {
		acc[Object.keys(obj)[0]] = obj[Object.keys(obj)[0]];
		return acc;
	}, {});
	for (let i = 0; i < arr.length; i += 1) {
		opts[arr[i]] = opts[arr[i]].reduce((acc, obj) => {
			acc[Object.keys(obj)[0]] = obj[Object.keys(obj)[0]];
			return acc;
		}, {});
	}
	return opts;
}

module.exports = async (bot, interaction) => {
	if (!interaction.isCommand()) {
		return;
	}
	const cmd = bot.commands.get(interaction.commandName);
	const perms = await bot.elevation(interaction);
	const options = JSON.stringify(getOpts(interaction.options.data));
	console.log(colors.grey(`* ${interaction.member.displayName} used command /${interaction.commandName}${interaction.options.data.length?`: ${options}`:""}`));
	const response = await connection.select("*", "servcom", `server_id='${interaction.channel.guild.id}' AND comname='${interaction.commandName}'`);
	if (response[0]) {
		let strs;
		let results;
		if (response[0].comtext) {
			strs = response[0].comtext;
			results = strs.slice(1, strs.length - 1);
		}
		if (response[0].permlvl > perms) {
			interaction.reply({
				content: "You do not have permission to use this command.",
				ephemeral: true
			});
			return;
		}
		if (response[0].type === "simple") {
			return interaction.reply({
				content: results,
				ephemeral: true
			});
		} else if (response[0].type === "quote") {
			// await interaction.deferReply({
			// 	ephemeral: true
			// });
			const term = interaction.options.getString("term");
			const action = interaction.options.getString("action");
			let args = [];
			if (term && action) {
				args = [action, ...term.split(" ")];
			} else if (term) {
				args = [...term.split(" ")];
			} else if (action) {
				args = [action];
			}
			await customQuotes(interaction, args, interaction.commandName, perms);
			return;
		}
	} else if (cmd) {
		cmd.runSlash(bot, interaction);
	}
};
