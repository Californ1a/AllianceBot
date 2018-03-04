const admin = require("firebase-admin");
let possibleroulettebets;
let roulettenumberproperties;

admin.initializeApp({
	credential: admin.credential.cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: `${process.env.FIREBASE_EMAIL}.iam.gserviceaccount.com`,
		privateKey: `-----BEGIN PRIVATE KEY-----\n${process.env.FIREBASE_KEY.replace(/\\n/g, "\n")}\n-----END PRIVATE KEY-----\n`
	}),
	databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

let db = admin.database();

//preload roulette betting data


module.exports = {
	db,
	possibleroulettebets,
	roulettenumberproperties
};
