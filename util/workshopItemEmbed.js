const request = require("request");
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

let count = 0;
const time = 1000;
const re = (opts, cb) => {
	if (count === 10) {
		return cb(new Error("Request took too long."));
	}
	count++;
	console.log(`Attempt #${count}...`);
	request(opts, (err, res, body) => {
		if (err) {
			cb(new Error(err));
		}
		if (res.statusCode === 200) {
			count = 0;
			cb(null, JSON.parse(body).response.publishedfiledetails[0]);
		} else {
			console.log(`Waiting ${time/1000} seconds...`);
			setTimeout(() => {
				// time *= 2;
				re(opts, cb);
			}, time);
		}
	});
};

const req = (opts) => {
	return new Promise((resolve, reject) => {
		console.log("Attempting to map data...");
		re(opts, (err, json) => {
			if (err) {
				reject(err);
			}
			resolve(json);
		});
	});
};

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
			"content-type": "multipart/form-data"
		},
		formData: {
			itemcount: "1",
			"publishedfileids[0]": mapid
		}
	};
	send(msg.channel, "Obtaining map data...").then(m => {
		req(options).then(json => {
			const steamid = json.creator;
			// console.log(JSON.stringify(json, null, 2));
			if (json.creator_app_id !== 233610 || json.creator_app_id !== json.consumer_app_id) {
				m.edit("This workshop item is not from Distance - Only Distance maps are allowed.").then(m => {
					setTimeout(() => m.delete().catch(console.error), botmsgDeleteTimeout);
				});
				msg.delete().then(msg => console.log(`Deleted message from ${msg.member.displayName}`)).catch(console.error);
			} else {
				const embed = new MessageEmbed()
					.setTitle(json.title)
					.setDescription(`${json.description.slice(0, 200)}...\n\n[Direct Download Link](${json.file_url})\n\n`)
					.setURL(`https://steamcommunity.com/sharedfiles/filedetails/?id=${mapid}`)
					.setColor(4886754)
					//.setThumbnail(json.preview_url)
					.setImage(json.preview_url)
					.addField("File Name", json.filename, true)
					.addField("File Size", `${Math.floor(json.file_size/1000).toLocaleString()}KB`, true);
				let modes = [];
				let difficulty;
				for (const tag of json.tags) {
					switch (tag.tag) {
						//begin difficulities
						case "Casual":
							difficulty = "Casual";
							break;
						case "Normal":
							difficulty = "Normal";
							break;
						case "Advanced":
							difficulty = "Advanced";
							break;
						case "Expert":
							difficulty = "Expert";
							break;
						case "Nightmare":
							difficulty = "Nightmare";
							break;
							//begin modes
						case "Sprint":
							modes.push("Sprint");
							break;
						case "Reverse Tag":
							modes.push("Reverse Tag");
							break;
						case "Challenge":
							modes.push("Challenge");
							break;
						case "Stunt":
							modes.push("Stunt");
							break;
						case "Trackmogrify":
							modes.push("Trackmogrify");
							break;
						case "Main Menu":
							modes.push("Main Menu");
							break;
					}
				}
				difficulty = (difficulty) ? difficulty : "None";
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
						embed.setAuthor(name, avatar, profile);
						m.edit({ content: `A new map posted by ${msg.author}`, embeds: [embed] }).then(() => {
							msg.delete().then(msg => console.log(`Deleted message from ${msg.member.displayName}`)).catch(console.error);
						}).catch(console.error);
					}
				});
			}
		}).catch(err => {
			m.edit("Failed to obtain map info. Make sure your map is public and try again in a few minutes.").then(m => m.delete(botmsgDeleteTimeout)).catch(console.error);
			msg.delete().then(msg => console.log(`Deleted message from ${msg.member.displayName}`)).catch(console.error);
			console.error(err);
		});
	}).catch(console.error);
};
