const c = require("../advent.js");

it("command properties exist", () => {
	const confProps = ["guildOnly", "aliases", "permLevel", "onCooldown", "cooldownTimer"];
	const helpProps = ["name", "description", "extendedDescription", "usage"];
	for (let elt of confProps) {
		expect(c.conf).toHaveProperty(elt);
	}
	for (let elt of helpProps) {
		expect(c.help).toHaveProperty(elt);
	}
});
