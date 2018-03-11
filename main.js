const pm2 = require("pm2");

const MACHINE_NAME = "Heroku1";
const PRIVATE_KEY = process.env.KEYMETRICS_PRIVATE_KEY; // Keymetrics Private key
const PUBLIC_KEY = process.env.KEYMETRICS_PUBLIC_KEY; // Keymetrics Public  key

//let instances = process.env.WEB_CONCURRENCY || -1; // Set by Heroku or -1 to scale to max cpu core -1
//let maxMemory = process.env.WEB_MEMORY || 512; // " " "

pm2.connect(function() {
	pm2.start({
		script: "bot.js",
		name: "alliance", // ----> THESE ATTRIBUTES ARE OPTIONAL:
		//exec_mode : 'cluster',            // ----> https://github.com/Unitech/PM2/blob/master/ADVANCED_README.md#schema
		//instances : instances,
		//max_memory_restart : maxMemory + 'M',   // Auto-restart if process takes more than XXmo
		env: { // If needed declare some environment variables
			"DISCORD_TOKEN": process.env.DISCORD_TOKEN,
			"OPBEAT_APP_ID": process.env.OPBEAT_APP_ID,
			"OPBEAT_ORGANIZATION_ID": process.env.OPBEAT_ORGANIZATION_ID,
			"OPBEAT_SECRET_TOKEN": process.env.OPBEAT_SECRET_TOKEN,
			"PAPERTRAIL_API_TOKEN": process.env.PAPERTRAIL_API_TOKEN,
			"TWITTER_ACCESS_TOKEN": process.env.TWITTER_ACCESS_TOKEN,
			"TWITTER_ACCESS_TOKEN_SECRET": process.env.TWITTER_ACCESS_TOKEN_SECRET,
			"TWITTER_CONSUMER_KEY": process.env.TWITTER_CONSUMER_KEY,
			"TWITTER_CONSUMER_SECRET": process.env.TWITTER_CONSUMER_SECRET,
			"NODE_NO_HTTP2": 1
		},
		"log_date_format": "YYYY-MM-DD HH:mm Z",
		args: [
			"--color"
		],
		"post_update": ["npm install"] // Commands to execute once we do a pull from Keymetrics
	}, function() {
		pm2.interact(PRIVATE_KEY, PUBLIC_KEY, MACHINE_NAME, function() {

			// Display logs in standard output
			pm2.launchBus(function(err, bus) {
				console.log("[PM2] Log streaming started");

				bus.on("log:out", function(packet) {
					console.log("[App:%s] %s", packet.process.name, packet.data);
				});

				bus.on("log:err", function(packet) {
					console.error("[App:%s][Err] %s", packet.process.name, packet.data);
				});
			});


		});
	});
});
