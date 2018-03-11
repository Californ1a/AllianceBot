const mysql = require("mysql");
const sqlconfig = {
	host: process.env.JAWSDB_HOST,
	user: process.env.JAWSDB_USER,
	password: process.env.JAWSDB_PASS,
	database: process.env.JAWSDB_DB,
	charset: "utf8mb4",
	connectionLimit: 3
};

const pool = mysql.createPool(sqlconfig);

module.exports = {
	query() {
		let sqlArgs = [];
		const args = [];
		for (let i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		const callback = args[args.length - 1]; //last arg is callback
		pool.getConnection(function(err, connection) {
			if (err) {
				console.error(err);
				return callback(err);
			}
			if (args.length > 2) {
				sqlArgs = args[1];
			}
			connection.query(args[0], sqlArgs, function(err, results) {
				connection.release(); // always put connection back in pool after last query
				if (err) {
					console.error(err);
					return callback(err);
				}
				callback(null, results);
			});
		});
	}
};
