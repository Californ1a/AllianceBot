const send = require("../util/sendMessage.js");
const fetch = require("node-fetch");
const {
	MessageEmbed
} = require("discord.js");
const colors = require("colors");

async function getSteamUsers(steamids) {
	const params = new URLSearchParams({
		steamids: steamids.join(",")
	});
	const options = {
		headers: {
			"cache-control": "no-cache",
			"Content-Type": "application/x-www-form-urlencoded",
			"x-webapi-key": process.env.STEAM_API_KEY
		},
		form: false
	};
	try {
		const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?${params}`;
		console.log(`Fetching Steam users: ${colors.green(url)}`);
		const res = await fetch(url, options);
		const data = await res.json();
		return data.response.players;
	} catch (e) {
		throw Error(e);
	}
}

async function getWorkshopQueryResults(searchQuery, searchType = "relevance") {
	if (!searchQuery || searchQuery === "") {
		searchType = "recent";
	}
	let queryType = 12;
	switch (searchType) {
		case "relevance":
			queryType = 12;
			break;
		case "recent":
			queryType = 1;
			searchQuery = "";
			break;
		case "popular":
			queryType = 3;
			searchQuery = "";
			break;
		default:
			break;
	}
	const params = new URLSearchParams({
		appid: "233610",
		search_text: searchQuery, // eslint-disable-line camelcase
		numperpage: 100,
		cursor: "*",
		return_details: 1, // eslint-disable-line camelcase
		query_type: queryType, // eslint-disable-line camelcase
		days: 90
	});
	const options = {
		headers: {
			"cache-control": "no-cache",
			"Content-Type": "application/x-www-form-urlencoded",
			"x-webapi-key": process.env.STEAM_API_KEY
		},
		form: false
	};
	try {
		const url = `https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?${params}`;
		console.log(`Fetching workshop maps: ${colors.green(url)}`);
		const res = await fetch(url, options);
		const data = await res.json();
		return {
			queryType,
			searchQuery,
			data: data.response
		};
	} catch (e) {
		throw Error(e);
	}
}

function countMatchingBrackets(str) {
	let count = 0;
	for (let i = 0; i < str.length; i++) {
		if (str[i] === "[") {
			count++;
		} else if (str[i] === "]") {
			count--;
		}
		if (count < 0) {
			count = 0;
		}
	}
	return count;
}

async function createMessageEmbed({
	queryType,
	searchQuery,
	data
}, msg, byAuthor) {
	const searchURL = `https://steamcommunity.com/workshop/browse/?appid=233610&searchtext=${searchQuery.replace(/\s+/g, "+")}&browsesort=textsearch`;
	const recentURL = "https://steamcommunity.com/workshop/browse/?appid=233610&browsesort=mostrecent&actualsort=mostrecent";
	const popularURL = "https://steamcommunity.com/workshop/browse/?appid=233610&browsesort=trend&actualsort=trend&days=90";
	let workshopURL = "";
	let desc = "";
	const by = (byAuthor) ? ` by \`${byAuthor}\`` : "";
	switch (queryType) {
		case 12:
			workshopURL = searchURL;
			desc = `🔍 Search results for \`${searchQuery}\`${by}`;
			break;
		case 1:
			workshopURL = recentURL;
			desc = `🆕 Recent workshop uploads${by}`;
			break;
		case 3:
			workshopURL = popularURL;
			desc = `⭐ Most popular (3 months)${by}`;
			break;
		default:
			break;
	}
	let steamids = data.publishedfiledetails.map((map) => map.creator);
	steamids = [...new Set(steamids)];
	const steamUsers = await getSteamUsers(steamids);
	data.publishedfiledetails.forEach((map) => {
		map.creator = steamUsers.find((user) => user.steamid === map.creator);
	});
	if (byAuthor) {
		data.publishedfiledetails = data.publishedfiledetails.filter((map) => map.creator.personaname.toLowerCase().indexOf(byAuthor.toLowerCase()) >= 0);
	}
	if (data.publishedfiledetails.length < 1) {
		return "No data";
	}
	data.publishedfiledetails = data.publishedfiledetails.slice(0, 8);
	let imgIndex = null;
	const list = data.publishedfiledetails.reduce((acc, map, i) => {
		// const author = steamUsers.filter((user) => user.steamid === map.creator)[0];
		map.creator.personaname = (map.creator.personaname.length > 18) ? `${map.creator.personaname.substr(0, 18)}...` : map.creator.personaname;
		map.creator.personaname = (map.creator.personaname.includes("[") && !map.creator.personaname.includes("]")) ? `${map.creator.personaname}]` : map.creator.personaname;
		const title = (map.title.length > 28) ? `${map.title.substr(0, 28)}...` : map.title;
		// title = title.replace(/\*/g, "\\*");
		const url = `https://steamcommunity.com/sharedfiles/filedetails/?id=${map.publishedfileid}`;

		// add an ending ] if title includes a starting [ but no end
		const closeBracketCount = countMatchingBrackets(title);
		const fixMarkdownLink = (closeBracketCount > 0) ? `${title}${"]".repeat(closeBracketCount)}` : title;

		// const base = `**[${title}](${url})**: `;
		// let fileDescription = `${map.file_description.substr(0, 135 - base.length).replace(/[\r\n]/g, " ").trim()}...`; // eslint-disable-line camelcase
		// fileDescription = (map.file_description.length + 3 === fileDescription.length) ? map.file_description : fileDescription;
		// return `${acc}${base}${fileDescription}\n`;
		let emoji = "";
		if (map.preview_url && !imgIndex) {
			emoji = "🖼️";
			imgIndex = i + 1;
		} else {
			emoji = "🔗";
		}
		// const emoji = (acc === "") ? "🖼️" : "🔗";
		return `${acc}${emoji} **[${fixMarkdownLink}](${url})**: ${map.subscriptions.toLocaleString()} subs • by [${map.creator.personaname}](${map.creator.profileurl}myworkshopfiles/?appid=233610)\n`;
	}, "");
	if (msg.channel.guild.id === "211599888222257152") { // dev
		msg.channel.guild.name = "Distance";
		msg.channel.guild.iconURL = () => "https://cdn.discordapp.com/icons/83078957620002816/975cd82978e995a4de73840649ab3f74.png";
	}
	console.log(workshopURL);
	const embed = new MessageEmbed()
		.setAuthor({
			name: `${msg.channel.guild.name} workshop`,
			iconURL: msg.channel.guild.iconURL(),
			url: workshopURL
		})
		.setDescription(`${desc}\n\n${list}`)
		.setColor("#3498db")
		.setFooter({
			text: `• Returned ${data.publishedfiledetails.length} result${(data.publishedfiledetails.length > 1) ? "s" : ""}`
		})
		.setTimestamp();
	if (data.publishedfiledetails[imgIndex - 1] && data.publishedfiledetails[imgIndex - 1].preview_url) {
		embed.setThumbnail(`${data.publishedfiledetails[imgIndex-1].preview_url}?impolicy=Letterbox`);
	}
	return embed;

}

exports.run = async (bot, msg, args) => {
	if (!args[0]) {
		return await send(msg.channel, "You must include a search term.");
	}
	let searchQuery = args.join(" ");
	let queryType = "relevance";
	let author;
	if (args[0].match(/^(new|recent)$/i)) {
		queryType = "recent";
	} else if (args[0].match(/^(top|popular)$/i)) {
		queryType = "popular";
	}
	if (args.includes("by")) {
		const byIndex = args.indexOf("by");
		if (byIndex === 0) {
			return await send(msg.channel, "You must include a search term.");
		}
		searchQuery = args.slice(0, byIndex).join(" ");
		author = args.slice(byIndex + 1);
		if (author.length > 0) {
			author = author.join(" ");
		} else {
			author = null;
		}
	}
	const m = await send(msg.channel, "Loading...");
	try {
		const data = await getWorkshopQueryResults(searchQuery, queryType);
		// console.log(JSON.stringify(data, null, 2));
		if (data.data.total < 1) {
			return await m.edit(`No results found for \`${data.searchQuery}\`${(author) ? ` by \`${author}\`` : ""}`);
		}
		const embed = await createMessageEmbed(data, msg, author);
		if (embed === "No data") {
			return await m.edit(`No results found for \`${searchQuery}\`${(author) ? ` by \`${author}\`` : ""}`);
		} else {
			await m.edit({
				content: "\u200b",
				embeds: [embed]
			});
		}
	} catch (e) {
		console.error(e);
		await m.edit("Failed getting workshop data.");
	}
};

exports.runSlash = async (bot, interaction) => {
	let queryType = "relevance";
	let author;
	const searchQuery = interaction.options.getString("search");
	const intAuthor = interaction.options.getString("author");
	if (searchQuery?.match(/^(new|recent)$/i)) {
		queryType = "recent";
	} else if (searchQuery?.match(/^(top|popular)$/i)) {
		queryType = "popular";
	}
	if (intAuthor) {
		author = intAuthor;
	}
	await interaction.deferReply({
		ephemeral: true
	});
	try {
		const data = await getWorkshopQueryResults(searchQuery, queryType);
		// console.log(JSON.stringify(data, null, 2));
		if (data.data.total < 1) {
			return await interaction.editReply(`No results found for \`${data.searchQuery}\`${(author) ? ` by \`${author}\`` : ""}`);
		}
		const embed = await createMessageEmbed(data, interaction, author);
		if (embed === "No data") {
			return await interaction.editReply(`No results found for \`${searchQuery}\`${(author) ? ` by \`${author}\`` : ""}`);
		} else {
			await interaction.editReply({
				content: "\u200b",
				embeds: [embed]
			});
		}
	} catch (e) {
		console.error(e);
		await interaction.editReply("Failed getting workshop data.");
	}
};

exports.conf = {
	guildOnly: true,
	aliases: ["ws"],
	permLevel: 0,
	onCooldown: false,
	cooldownTimer: 1000
};

exports.help = {
	name: "workshop",
	description: "Search the workshop for maps.",
	extendedDescription: "",
	usage: "workshop <search term|new|top>"
};

exports.slash = {
	name: "workshop",
	description: "Search the workshop",
	defaultPermission: false,
	options: [{
		name: "search",
		description: "The search term",
		type: "STRING",
		required: true
	}, {
		name: "author",
		description: "Search by author name",
		type: "STRING"
	}]
};

/*
--- query_type ---

RankedByVote = 0
RankedByPublicationDate = 1
AcceptedForGameRankedByAcceptanceDate = 2
RankedByTrend = 3
FavoritedByFriendsRankedByPublicationDate = 4
CreatedByFriendsRankedByPublicationDate = 5
RankedByNumTimesReported = 6
CreatedByFollowedUsersRankedByPublicationDate = 7
NotYetRated = 8
RankedByTotalUniqueSubscriptions = 9
RankedByTotalVotesAsc = 10
RankedByVotesUp = 11
RankedByTextSearch = 12
RankedByPlaytimeTrend = 13
RankedByTotalPlaytime = 14
RankedByAveragePlaytimeTrend = 15
RankedByLifetimeAveragePlaytime = 16
RankedByPlaytimeSessionsTrend = 17
RankedByLifetimePlaytimeSessions = 18
RankedByInappropriateContentRating = 19
*/
