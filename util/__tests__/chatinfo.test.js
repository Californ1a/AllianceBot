const rewire = require("rewire");
const chatinfo = rewire("../chatinfo.js");
//jest.mock("fs-extra");

it("message date", () => {
	const messageDate = chatinfo.__get__("messageDate");
	const d = new Date("December 17, 1995 03:24:00");
	const msg = {
		createdAt: d
	};
	expect(messageDate(msg)).toEqual({
		formattedDate: "Dec 17, 1995 03:24:00 AM",
		year: "1995",
		month: "Dec",
		hour: "03",
		minute: "24",
		ampm: "AM"
	});
});

it("getMaxRole", () => {
	const user = {
		roles: {
			size: 2,
			exists: () => {
				return;
			},
			find: () => {
				return;
			}
		},
		user: {
			bot: false
		},
		guild: {
			roles: {
				size: 1,
				find: () => {
					return {
						position: 1,
						name: "Member"
					};
				}
			}
		},
		nickname: "Cali"
	};
	expect(chatinfo.getMaxRole(user)).toEqual({
		toprole: {
			position: 1,
			name: "Member"
		},
		isbot: "",
		nick: "Cali"
	});
});

// it("formatChatlog", () => {
// 	let fsMock = {
// 		mkdirsSync: () => {
// 			return;
// 		}
// 	};
// 	chatinfo.__set__("fs", fsMock);
// 	const d = new Date("December 17, 1995 03:24:00");
// 	const msg = {
// 		cleanContent: "Hey",
// 		createdAt: d,
// 		attachments: {
// 			size: 0
// 		},
// 		member: {
// 			id: "memberid",
// 			displayName: "Cali",
// 			highestRole: {
// 				name: "Member"
// 			}
// 		},
// 		author: {
// 			id: "authorid",
// 			username: "Californ1a"
// 		},
// 		guild: {
// 			name: "Distance",
// 			owner: {
// 				id: "ownerid"
// 			}
// 		},
// 		channel: {
// 			name: "lobby"
// 		},
// 		bot: false
// 	};
// 	expect(chatinfo.formatChatlog(msg)).toEqual({
// 		atturls: [],
// 		chatlinedata: "Dec 17, 1995 03:24:00 AM | (Member)Cali: Hey ",
// 		consoleChat: "03:24 AM [Distance/#lobby] (Member)Cali: Hey ",
// 		currentLog: "DiscordChatlogs/Distance/#lobby/1995/Dec.log",
// 		formattedAtturls: "",
// 		fullLog: "DiscordChatlogs/Distance/full_logs/#lobby.log",
// 		messageTime: {
// 			ampm: "AM",
// 			formattedDate: "Dec 17, 1995 03:24:00 AM",
// 			hour: "03",
// 			minute: "24",
// 			month: "Dec",
// 			year: "1995",
// 		}
// 	});
// });
