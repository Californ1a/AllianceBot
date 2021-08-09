const reqEvent = (event) => require(`../events/${event}`); // eslint-disable-line global-require
module.exports = (bot, stream, meter) => {
	bot.on("ready", () => reqEvent("ready")(bot));
	bot.on("shardReconnecting", (id) => reqEvent("shardReconnecting")(bot, id));
	bot.on("rateLimit", (rateLimitInfo) => reqEvent("rateLimit")(bot, rateLimitInfo));
	bot.on("shardDisconnect", (closeEvent, shardID) => reqEvent("shardDisconnect")(bot, closeEvent, shardID));
	bot.on("guildUnavailable", (guild) => reqEvent("guildUnavailable")(bot, guild));
	bot.on("guildCreate", (guild) => reqEvent("guildCreate")(bot, guild));
	bot.on("guildDelete", (guild) => reqEvent("guildDelete")(bot, guild));
	bot.on("presenceUpdate", (oldPresence, newPresence) => reqEvent("presenceUpdate")(bot, oldPresence, newPresence));
	bot.on("messageDelete", (msg) => reqEvent("messageDelete")(bot, msg));
	bot.on("messageDeleteBulk", (msgs) => reqEvent("messageDeleteBulk")(bot, msgs));
	bot.on("messageUpdate", (oldMessage, newMessage) => reqEvent("messageUpdate")(bot, oldMessage, newMessage));
	bot.on("guildMemberUpdate", (oldMember, newMember) => reqEvent("guildMemberUpdate")(bot, oldMember, newMember));
	bot.on("guildMemberAdd", (member) => reqEvent("guildMemberAdd")(bot, member));
	bot.on("guildMemberRemove", (member) => reqEvent("guildMemberRemove")(bot, member));
	bot.on("guildBanAdd", (guild, user) => reqEvent("guildBanAdd")(bot, guild, user));
	bot.on("guildBanRemove", (guild, user) => reqEvent("guildBanRemove")(bot, guild, user));
	bot.on("userUpdate", (oldUser, newUser) => reqEvent("userUpdate")(bot, oldUser, newUser));
	bot.on("messageCreate", (msg) => reqEvent("message")(bot, meter, msg));
	bot.on("interactionCreate", (interaction) => reqEvent("interactionCreate")(bot, interaction));
	if (stream) { // if NODE_ENV !== "dev"
		stream.on("tweet", (tweet) => reqEvent("tweet")(bot, tweet));
		stream.on("disconnect", (disconnectMessage) => reqEvent("tweetDisconnect")(bot, disconnectMessage));
		stream.on("connect", (request) => reqEvent("tweetConnect")(bot, request));
		stream.on("connected", (response) => reqEvent("tweetConnected")(bot, response));
		stream.on("reconnect", (request, response, connectInterval) => reqEvent("tweetReconnect")(bot, request, response, connectInterval));
		stream.on("error", (error) => reqEvent("tweetError")(bot, error));
	}
};
