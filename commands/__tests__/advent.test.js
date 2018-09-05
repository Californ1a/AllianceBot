const c = require("../advent.js");

it("command properties exist", () => {
	const confProps = ["guildOnly", "aliases", "permLevel", "onCooldown", "cooldownTimer"];
	const helpProps = ["name", "description", "extendedDescription", "usage"];
	for (const elt of confProps) {
		expect(c.conf).toHaveProperty(elt);
	}
	for (const elt of helpProps) {
		expect(c.help).toHaveProperty(elt);
	}
});
