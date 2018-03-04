const check = require("../checkMapIDs.js");

describe("MapID resolutions", () => {
	// #region Sprint Mode
	describe("Sprint", () => {
		describe("Broken Symmetry", () => {
			test("broken symmetry", () => {
				expect(check(["broken", "symmetry"])).toEqual({
					id: "1558337",
					mode: "sprint",
					name: "broken symmetry"
				});
			});
			test("bs", () => {
				expect(check(["bs"])).toEqual({
					id: "1558337",
					mode: "sprint",
					name: "broken symmetry"
				});
			});
		});
		describe("Lost Society", () => {
			test("lost society", () => {
				expect(check(["lost", "society"])).toEqual({
					id: "1558158",
					mode: "sprint",
					name: "lost society"
				});
			});
			test("ls", () => {
				expect(check(["ls"])).toEqual({
					id: "1558158",
					mode: "sprint",
					name: "lost society"
				});
			});
		});
		describe("Negative Space", () => {
			test("negative space", () => {
				expect(check(["negative", "space"])).toEqual({
					id: "1558398",
					mode: "sprint",
					name: "negative space"
				});
			});
			test("ns", () => {
				expect(check(["ns"])).toEqual({
					id: "1558398",
					mode: "sprint",
					name: "negative space"
				});
			});
		});
		// =========================================================================
		// TODO: Insert Ground Zero when ID is known
		// =========================================================================
		describe("Departure", () => {
			test("departure", () => {
				expect(check(["departure"])).toEqual({
					id: "1558402",
					mode: "sprint",
					name: "departure"
				});
			});
		});
		describe("Friction", () => {
			test("friction", () => {
				expect(check(["friction"])).toEqual({
					id: "1558436",
					mode: "sprint",
					name: "friction"
				});
			});
		});
		describe("Aftermath", () => {
			test("friction", () => {
				expect(check(["aftermath"])).toEqual({
					id: "1558394",
					mode: "sprint",
					name: "aftermath"
				});
			});
		});
		describe("The Thing About Machines", () => {
			test("the thing about machines", () => {
				expect(check(["the", "thing", "about", "machines"])).toEqual({
					id: "1558441",
					mode: "sprint",
					name: "the thing about machines"
				});
			});
			test("thing about machines", () => {
				expect(check(["thing", "about", "machines"])).toEqual({
					id: "1558441",
					mode: "sprint",
					name: "the thing about machines"
				});
			});
			test("machines", () => {
				expect(check(["machines"])).toEqual({
					id: "1558441",
					mode: "sprint",
					name: "the thing about machines"
				});
			});
			test("ttam", () => {
				expect(check(["ttam"])).toEqual({
					id: "1558441",
					mode: "sprint",
					name: "the thing about machines"
				});
			});
		});
		describe("Amusement", () => {
			test("amusement", () => {
				expect(check(["amusement"])).toEqual({
					id: "1558304",
					mode: "sprint",
					name: "amusement"
				});
			});
		});
		describe("Corruption", () => {
			test("corruption", () => {
				expect(check(["corruption"])).toEqual({
					id: "1558416",
					mode: "sprint",
					name: "corruption"
				});
			});
		});
		describe("The Observer Effect", () => {
			test("the observer effect", () => {
				expect(check(["the", "observer", "effect"])).toEqual({
					id: "1558453",
					mode: "sprint",
					name: "the observer effect"
				});
			});
			test("observer effect", () => {
				expect(check(["observer", "effect"])).toEqual({
					id: "1558453",
					mode: "sprint",
					name: "the observer effect"
				});
			});
			test("observer", () => {
				expect(check(["observer"])).toEqual({
					id: "1558453",
					mode: "sprint",
					name: "the observer effect"
				});
			});
			test("toe", () => {
				expect(check(["toe"])).toEqual({
					id: "1558453",
					mode: "sprint",
					name: "the observer effect"
				});
			});
		});
		describe("Dissolution", () => {
			test("dissolution", () => {
				expect(check(["dissolution"])).toEqual({
					id: "1558428",
					mode: "sprint",
					name: "dissolution"
				});
			});
		});
		describe("Falling Through", () => {
			test("falling through", () => {
				expect(check(["falling", "through"])).toEqual({
					id: "1558435",
					mode: "sprint",
					name: "falling through"
				});
			});
			test("falling", () => {
				expect(check(["falling"])).toEqual({
					id: "1558435",
					mode: "sprint",
					name: "falling through"
				});
			});
			test("ft", () => {
				expect(check(["ft"])).toEqual({
					id: "1558435",
					mode: "sprint",
					name: "falling through"
				});
			});
		});
		describe("Monolith", () => {
			test("monoloth", () => {
				expect(check(["monolith"])).toEqual({
					id: "1558429",
					mode: "sprint",
					name: "monolith"
				});
			});
		});
		describe("Uncanny Valley", () => {
			test("uncanny valley", () => {
				expect(check(["uncanny", "valley"])).toEqual({
					id: "1558467",
					mode: "sprint",
					name: "uncanny valley"
				});
			});
			test("uncanny", () => {
				expect(check(["uncanny"])).toEqual({
					id: "1558467",
					mode: "sprint",
					name: "uncanny valley"
				});
			});
			test("uv", () => {
				expect(check(["uv"])).toEqual({
					id: "1558467",
					mode: "sprint",
					name: "uncanny valley"
				});
			});
		});
		// =========================================================================
		// TODO: Insert The Manor when ID is known
		// =========================================================================
	});
	// #endregion Sprint Mode


	// #region Challenge Mode
	describe("Challenge", () => {
		describe("Dodge", () => {
			test("dodge", () => {
				expect(check(["dodge"])).toEqual({
					id: "1558764",
					mode: "challenge",
					name: "dodge"
				});
			});
		});
		describe("Thunder Struck", () => {
			test("thunder struck", () => {
				expect(check(["thunder", "struck"])).toEqual({
					id: "1558769",
					mode: "challenge",
					name: "thunder struck"
				});
			});
			test("thunderstruck", () => {
				expect(check(["thunderstruck"])).toEqual({
					id: "1558769",
					mode: "challenge",
					name: "thunder struck"
				});
			});
			test("thunder", () => {
				expect(check(["thunder"])).toEqual({
					id: "1558769",
					mode: "challenge",
					name: "thunder struck"
				});
			});
			test("ts", () => {
				expect(check(["ts"])).toEqual({
					id: "1558769",
					mode: "challenge",
					name: "thunder struck"
				});
			});
		});
		describe("Grinder", () => {
			test("grinder", () => {
				expect(check(["grinder"])).toEqual({
					id: "1558800",
					mode: "challenge",
					name: "grinder"
				});
			});
		});
		describe("Descent", () => {
			test("descent", () => {
				expect(check(["descent"])).toEqual({
					id: "1558836",
					mode: "challenge",
					name: "descent"
				});
			});
		});
		describe("Detached", () => {
			test("detached", () => {
				expect(check(["detached"])).toEqual({
					id: "1558817",
					mode: "challenge",
					name: "detached"
				});
			});
		});
		describe("Elevation", () => {
			test("elevation", () => {
				expect(check(["elevation"])).toEqual({
					id: "1558823",
					mode: "challenge",
					name: "elevation"
				});
			});
		});
		describe("Red Heat", () => {
			test("red heat", () => {
				expect(check(["red", "heat"])).toEqual({
					id: "2011155",
					mode: "challenge",
					name: "red heat"
				});
			});
			test("rh", () => {
				expect(check(["rh"])).toEqual({
					id: "2011155",
					mode: "challenge",
					name: "red heat"
				});
			});
		});
		describe("Disassembly Line", () => {
			test("disassembly line", () => {
				expect(check(["disassembly", "line"])).toEqual({
					id: "2011156",
					mode: "challenge",
					name: "disassembly line"
				});
			});
			test("disassembly", () => {
				expect(check(["disassembly"])).toEqual({
					id: "2011156",
					mode: "challenge",
					name: "disassembly line"
				});
			});
			test("dl", () => {
				expect(check(["dl"])).toEqual({
					id: "2011156",
					mode: "challenge",
					name: "disassembly line"
				});
			});
		});
	});
	// #endregion Challenge Mode

	// #region Stunt Mode
	describe("Stunt", () => {
		describe("Credits", () => {
			test("credits", () => {
				expect(check(["credits"])).toEqual({
					id: "1588771",
					mode: "stunt",
					name: "credits"
				});
			});
		});
		describe("Refraction", () => {
			test("refraction", () => {
				expect(check(["refraction"])).toEqual({
					id: "1589164",
					mode: "stunt",
					name: "refraction"
				});
			});
		});
		describe("Space Skate", () => {
			test("space skate", () => {
				expect(check(["space", "skate"])).toEqual({
					id: "1561263",
					mode: "stunt",
					name: "space skate"
				});
			});
		});
		describe("Spooky Town", () => {
			test("spooky town", () => {
				expect(check(["spooky", "town"])).toEqual({
					id: "1573802",
					mode: "stunt",
					name: "spooky town"
				});
			});
		});
		describe("Stunt Playground", () => {
			test("stunt playground", () => {
				expect(check(["stunt", "playground"])).toEqual({
					id: "1561573",
					mode: "stunt",
					name: "stunt playground"
				});
			});
		});
		describe("Tagtastic", () => {
			test("tagtastic", () => {
				expect(check(["tagtastic"])).toEqual({
					id: "1572280",
					mode: "stunt",
					name: "tagtastic"
				});
			});
		});
		describe("Neon Park", () => {
			test("neon park", () => {
				expect(check(["neon", "park"])).toEqual({
					id: "1952913",
					mode: "stunt",
					name: "neon park"
				});
			});
			test("np", () => {
				expect(check(["np"])).toEqual({
					id: "1952913",
					mode: "stunt",
					name: "neon park"
				});
			});
		});
	});
	// #endregion Stunt Mode
});
