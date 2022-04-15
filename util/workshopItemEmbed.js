const fetch = require("node-fetch");
const Steam = require("steam-web");
const send = require("./sendMessage.js");
const {
	MessageEmbed
} = require("discord.js");
const s = new Steam({
	apiKey: process.env.STEAM_API_KEY,
	format: "json"
});
const botmsgDeleteTimeout = 8000;

async function apiCall(options) {
	const body = new URLSearchParams(options.formData);
	const response = await fetch(options.url, {
		method: options.method,
		headers: options.headers,
		body: body
	});
	if (response.status === 200) {
		return response.json();
	} else {
		throw new Error(`${response.status} ${response.statusText}`);
	}
}

const delay = retryCount => new Promise(resolve => setTimeout(resolve, 10 ** retryCount));

async function getResource(options, retryCount = 0, lastError = null) {
	if (retryCount > 5) {
		throw new Error(lastError);
	}
	try {
		return apiCall(options);
	} catch (e) {
		await delay(retryCount);
		return getResource(options, retryCount + 1, e);
	}
}

module.exports = async (bot, msg) => {
	if (msg.author.id === bot.user.id) {
		return;
	}
	const reg = /^<?https?:\/\/(www\.)?steamcommunity\.com\/(sharedfiles|workshop)\/filedetails\/\?id=(\d{9,10})(&searchtext=\S*)?>?$/;
	// console.log(!reg.exec(msg.content.trim()));
	if (!reg.test(msg.content.trim())) {
		const perms = await bot.elevation(msg);
		if (perms >= 2) {
			return;
		}
		send(msg.channel, "You can only post links to the workshop here.").then(m => {
			setTimeout(() => m.delete().catch(console.error), botmsgDeleteTimeout);
		}).catch(console.error);
		return msg.delete().then(msg => console.log(`Deleted message from ${msg.member.displayName}`)).catch(console.error);
	}
	const rege = reg.exec(msg.content.trim());
	const mapid = rege[3];
	// console.log(rege);
	const options = {
		method: "POST",
		url: "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
		headers: {
			"Cache-Control": "no-cache",
			Authorization: `Bearer ${process.env.STEAM_API_KEY}`,
			"content-type": "application/x-www-form-urlencoded"
		},
		formData: {
			itemcount: "1",
			"publishedfileids[0]": mapid
		}
	};
	send(msg.channel, "Obtaining map data...").then(m => {
		getResource(options).then(data => {
			const json = data.response.publishedfiledetails[0];
			const steamid = json.creator;
			// console.log(JSON.stringify(json, null, 2));
			if (json.consumer_app_id !== 233610 && (json.creator_app_id !== json.consumer_app_id || json.creator_app_id === 766)) {
				m.edit("This workshop item is not from Distance - Only Distance maps are allowed.").then(m => {
					setTimeout(() => m.delete().catch(console.error), botmsgDeleteTimeout);
				});
				msg.delete().then(msg => console.log(`Deleted message from ${msg.member.displayName}`)).catch(console.error);
			} else {
				const embed = new MessageEmbed()
					.setTitle(json.title)
					.setDescription(`${json.description.slice(0, 200)}${(json.description.length>200)?"...":""}${(json.creator_app_id === 233610)?`\n\n[Direct Download Link](${json.file_url})\n\n`:""}`)
					.setURL(`https://steamcommunity.com/sharedfiles/filedetails/?id=${mapid}`)
					.setColor(4886754);
				if (json.creator_app_id === 233610) {
					embed.addField("File Name", json.filename, true)
						.addField("File Size", `${Math.floor(json.file_size/1000).toLocaleString()}KB`, true)
						.setImage(json.preview_url);
				} else {
					embed.addField("Type", "Collection", true)
						.setThumbnail(json.preview_url);
				}
				let modes = [];
				let difficulty = [];
				for (const tag of json.tags) {
					switch (tag.tag) {
						//begin difficulities
						case "Casual":
						case "Normal":
						case "Advanced":
						case "Expert":
						case "Nightmare":
							difficulty.push(tag.tag);
							break;
							//begin modes
						case "Sprint":
						case "Reverse Tag":
						case "Challenge":
						case "Stunt":
						case "Trackmogrify":
						case "Main Menu":
							modes.push(tag.tag);
							break;
					}
				}
				difficulty = (difficulty.length === 0) ? "None" : difficulty.join(", ");
				modes = (modes.length === 0) ? "None" : modes.join(", ");
				embed.addField("Mode(s)", modes, true)
					.addField("Difficulty", difficulty, true);
				s.getPlayerSummaries({
					steamids: [`${steamid}`],
					callback: (err, data) => {
						const res = data.response.players[0];
						const name = res.personaname;
						const profile = res.profileurl;
						const avatar = res.avatar;
						embed.setAuthor({
							name,
							iconURL: avatar,
							url: profile
						});
						m.edit({
							content: `A new ${(json.creator_app_id === 233610)?"map":"collection"} posted by ${msg.author}`,
							embeds: [embed]
						}).then(() => {
							msg.delete().then(msg => console.log(`Deleted message from ${msg.member.displayName}`)).catch(console.error);
						}).catch(console.error);
					}
				});
			}
		}).catch(err => {
			m.edit("Failed to obtain map info. Make sure your map is public and try again in a few minutes.")
				.then(m => setTimeout(() => m.delete().catch(console.error), botmsgDeleteTimeout)).catch(console.error);
			msg.delete().then(msg => console.log(`Deleted message from ${msg.member.displayName}`)).catch(console.error);
			console.error(err);
		});
	}).catch(console.error);
};
