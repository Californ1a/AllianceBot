const check = require("../checkMapIDs.js");

describe("MapID resolutions", () => {
	// #region Sprint Mode
	describe("Sprint", () => {
		describe("Broken Symmetry", () => {
			test("broken symmetry", () => {
				expect(check(["broken", "symmetry"])).toBe("1558337");
			});
			test("bs", () => {
				expect(check(["bs"])).toBe("1558337");
			});
		});
		describe("Lost Society", () => {
			test("lost society", () => {
				expect(check(["lost", "society"])).toBe("1558158");
			});
			test("ls", () => {
				expect(check(["ls"])).toBe("1558158");
			});
		});
		describe("Negative Space", () => {
			test("negative space", () => {
				expect(check(["negative", "space"])).toBe("1558398");
			});
			test("ns", () => {
				expect(check(["ns"])).toBe("1558398");
			});
		});
		// =========================================================================
		// TODO: Insert Ground Zero when ID is known
		// =========================================================================
		describe("Departure", () => {
			test("departure", () => {
				expect(check(["departure"])).toBe("1558402");
			});
		});
		describe("Friction", () => {
			test("friction", () => {
				expect(check(["friction"])).toBe("1558436");
			});
		});
		describe("Aftermath", () => {
			test("friction", () => {
				expect(check(["aftermath"])).toBe("1558394");
			});
		});
		describe("The Thing About Machines", () => {
			test("the thing about machines", () => {
				expect(check(["the", "thing", "about", "machines"])).toBe("1558441");
			});
			test("thing about machines", () => {
				expect(check(["thing", "about", "machines"])).toBe("1558441");
			});
			test("machines", () => {
				expect(check(["machines"])).toBe("1558441");
			});
			test("ttam", () => {
				expect(check(["ttam"])).toBe("1558441");
			});
		});
		describe("Amusement", () => {
			test("amusement", () => {
				expect(check(["amusement"])).toBe("1558304");
			});
		});
		describe("Corruption", () => {
			test("corruption", () => {
				expect(check(["corruption"])).toBe("1558416");
			});
		});
		describe("The Observer Effect", () => {
			test("the observer effect", () => {
				expect(check(["the", "observer", "effect"])).toBe("1558453");
			});
			test("observer effect", () => {
				expect(check(["observer", "effect"])).toBe("1558453");
			});
			test("observer", () => {
				expect(check(["observer"])).toBe("1558453");
			});
			test("toe", () => {
				expect(check(["toe"])).toBe("1558453");
			});
		});
		describe("Dissolution", () => {
			test("dissolution", () => {
				expect(check(["dissolution"])).toBe("1558428");
			});
		});
		describe("Falling Through", () => {
			test("falling through", () => {
				expect(check(["falling", "through"])).toBe("1558435");
			});
			test("falling", () => {
				expect(check(["falling"])).toBe("1558435");
			});
			test("ft", () => {
				expect(check(["ft"])).toBe("1558435");
			});
		});
		describe("Monolith", () => {
			test("monoloth", () => {
				expect(check(["monolith"])).toBe("1558429");
			});
		});
		describe("Uncanny Valley", () => {
			test("uncanny valley", () => {
				expect(check(["uncanny", "valley"])).toBe("1558467");
			});
			test("uncanny", () => {
				expect(check(["uncanny"])).toBe("1558467");
			});
			test("uv", () => {
				expect(check(["uv"])).toBe("1558467");
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
				expect(check(["dodge"])).toBe("1558764");
			});
		});
		describe("Thunder Struck", () => {
			test("thunder struck", () => {
				expect(check(["thunder", "struck"])).toBe("1558769");
			});
			test("thunderstruck", () => {
				expect(check(["thunderstruck"])).toBe("1558769");
			});
			test("thunder", () => {
				expect(check(["thunder"])).toBe("1558769");
			});
			test("ts", () => {
				expect(check(["ts"])).toBe("1558769");
			});
		});
		describe("Grinder", () => {
			test("grinder", () => {
				expect(check(["grinder"])).toBe("1558800");
			});
		});
		describe("Descent", () => {
			test("descent", () => {
				expect(check(["descent"])).toBe("1558836");
			});
		});
		describe("Detached", () => {
			test("detached", () => {
				expect(check(["detached"])).toBe("1558817");
			});
		});
		describe("Elevation", () => {
			test("elevation", () => {
				expect(check(["elevation"])).toBe("1558823");
			});
		});
		describe("Red Heat", () => {
			test("red heat", () => {
				expect(check(["red", "heat"])).toBe("2011155");
			});
			test("rh", () => {
				expect(check(["rh"])).toBe("2011155");
			});
		});
		describe("Disassembly Line", () => {
			test("disassembly line", () => {
				expect(check(["disassembly", "line"])).toBe("2011156");
			});
			test("disassembly", () => {
				expect(check(["disassembly"])).toBe("2011156");
			});
			test("dl", () => {
				expect(check(["dl"])).toBe("2011156");
			});
		});
	});
	// #endregion Challenge Mode

	// #region Stunt Mode
	describe("Stunt", () => {
		describe("Credits", () => {
			test("credits", () => {
				expect(check(["credits"])).toBe("1588771");
			});
		});
		describe("Refraction", () => {
			test("refraction", () => {
				expect(check(["refraction"])).toBe("1589164");
			});
		});
		describe("Space Skate", () => {
			test("space skate", () => {
				expect(check(["space", "skate"])).toBe("1561263");
			});
		});
		describe("Spooky Town", () => {
			test("spooky town", () => {
				expect(check(["spooky", "town"])).toBe("1573802");
			});
		});
		describe("Stunt Playground", () => {
			test("stunt playground", () => {
				expect(check(["stunt", "playground"])).toBe("1561573");
			});
		});
		describe("Tagtastic", () => {
			test("tagtastic", () => {
				expect(check(["tagtastic"])).toBe("1572280");
			});
		});
		describe("Neon Park", () => {
			test("neon park", () => {
				expect(check(["neon", "park"])).toBe("1952913");
			});
			test("np", () => {
				expect(check(["np"])).toBe("1952913");
			});
		});
	});
	// #endregion Stunt Mode
});
