const reqEvent = (event) => require(`../events/${event}`); // eslint-disable-line global-require
module.exports = (bot, stream, meter) => {
	bot.on("ready", () => reqEvent("ready")(bot));
	bot.on("reconnecting", () => reqEvent("reconnecting")(bot));
	bot.on("disconnect", (closeEvent) => reqEvent("disconnect")(bot, closeEvent));
	bot.on("guildUnavailable", (guild) => reqEvent("guildUnavailable")(bot, guild));
	bot.on("guildCreate", (guild) => reqEvent("guildCreate")(bot, guild));
	bot.on("guildDelete", (guild) => reqEvent("guildDelete")(bot, guild));
	bot.on("presenceUpdate", (oldMember, newMember) => reqEvent("presenceUpdate")(bot, oldMember, newMember));
	bot.on("messageDelete", (msg) => reqEvent("messageDelete")(bot, msg));
	bot.on("messageUpdate", (oldMessage, newMessage) => reqEvent("messageUpdate")(bot, oldMessage, newMessage));
	bot.on("guildMemberUpdate", (oldMember, newMember) => reqEvent("guildMemberUpdate")(bot, oldMember, newMember));
	bot.on("guildMemberAdd", (member) => reqEvent("guildMemberUpdate")(bot, member));
	bot.on("message", (msg) => reqEvent("message")(bot, meter, msg));
	stream.on("tweet", (tweet) => reqEvent("tweet")(bot, tweet));
	stream.on("disconnect", (disconnectMessage) => reqEvent("tweetDisconnect")(bot, disconnectMessage));
	stream.on("connect", (request) => reqEvent("tweetConnect")(bot, request));
	stream.on("connected", (response) => reqEvent("tweetConnected")(bot, response));
	stream.on("reconnect", (request, response, connectInterval) => reqEvent("tweetReconnect")(bot, request, response, connectInterval));
	stream.on("error", (error) => reqEvent("tweetError")(bot, error));
};
