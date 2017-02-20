const mysql = require("mysql");
const sqlconfig = require("../logins/sqlconfig.js");

const pool = mysql.createPool(sqlconfig);

module.exports = {
	query() {
		var sqlArgs = [];
		var args = [];
		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		var callback = args[args.length - 1]; //last arg is callback
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
