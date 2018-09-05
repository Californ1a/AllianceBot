require("dotenv").config();
const colors = require("colors");
const m = require("../message.js");

it("does nothing when dm'd a non-command", () => {
	const bot = null;
	const meter = null;
	const msg = {
		content: "test",
		cleanContent: "test",
		author: {
			username: "Test User",
			bot: false
		}
	};
	console.log = jest.fn();
	const ret = m(bot, meter, msg);
	expect(console.log).toHaveBeenCalledWith(colors.grey(`(Private) ${msg.author.username}: ${msg.cleanContent}`));
	expect(ret).toBeUndefined();
});
