const colors = require("colors");
const Entities = require("html-entities").AllHtmlEntities;
const send = require("../util/sendMessage.js");
const entities = new Entities();
const fs = require("fs-extra");

module.exports = (bot, tweet) => {
	const tweetid = tweet.id_str;
	const tweetuser = tweet.user.screen_name;
	const emoji = (bot.guilds.get("83078957620002816")) ? bot.guilds.get("83078957620002816").emojis.find("name", "torcht") : "";
	//var intent = "https://twitter.com/intent";
	const profilelink = `https://twitter.com/${tweetuser}`;
	const tweetlink = `${profilelink}/status/${tweetid}`;
	let text = "";
	let desc = "";
	let medialink = "";
	let giflink = "";

	console.log(colors.red(`Found matching tweet: https://twitter.com/${tweetuser}/status/${tweetid} `));
	if ((typeof tweet.in_reply_to_screen_name !== "string" || tweet.in_reply_to_user_id === tweet.user.id) && !tweet.text.startsWith("RT @") && (!tweet.text.startsWith("@") || tweet.text.toLowerCase().startsWith("@" + tweet.user.screen_name.toLowerCase())) && (tweet.user.id_str === "628034104" || tweet.user.id_str === "241371699")) {
		const tweetjson = JSON.stringify(tweet, null, 2);

		fs.appendFile("tweet.json", tweetjson + "\r\n\r\n\r\n\r\n\r\n");

		if (tweet.extended_entities && tweet.extended_entities.media && tweet.extended_entities.media[0].type === "animated_gif") {
			giflink = tweet.extended_entities.media[0].video_info.variants[0].url;
		} else if (tweet.entities.media) {
			medialink = tweet.entities.media[0].media_url;
		}
		if (tweet.extended_tweet) {
			if (tweet.extended_tweet.entities.media) {
				medialink = tweet.extended_tweet.entities.media[0].media_url;
			}
		}
		if (tweet.extended_tweet) {
			if (tweet.extended_tweet.full_text) {
				text = entities.decode(tweet.extended_tweet.full_text.replace(/(https?:\/\/t.co\/[\w]+)$/, " "));
			}
		} else {
			text = entities.decode(tweet.text.replace(/(https?:\/\/t.co\/[\w]+)$/, " "));
		}
		desc = `${text}`;
		//desc += `\r\n\r\n**[View Tweet](${tweetlink})\r\n\r\n[Reply](${intent}/tweet?in_reply_to=${tweetid}) | [Retweet](${intent}/retweet?tweet_id=${tweetid}) | [Like](${intent}/like?tweet_id=${tweetid})**`;
		const embed = {
			embed: {
				color: 3447003,
				author: {
					name: tweet.user.name,
					url: profilelink,
					"icon_url": tweet.user.profile_image_url
				},
				url: tweetlink,
				description: `${desc}`,
				timestamp: new Date(tweet.created_at),
				footer: {
					text: `@${tweet.user.screen_name}`
				}
			}
		};
		if (giflink !== "") {
			embed.embed.video.url = giflink;
		} else if (medialink !== "") {
			embed.embed.image.url = medialink;
		}
		send(bot.channels.get("83078957620002816"), `${emoji} <${tweetlink}>`, embed).catch((error) => console.error(error));

	}
};
