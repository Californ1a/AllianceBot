//const connection = require("./sqlmanager.js");
const sql = require("sqlite");
sql.open("./alliancebot.sqlite");

var select = function(columns, table, where) {
	return new Promise((resolve, reject) => {
		if (typeof columns === "object") {
			columns = columns.join(", ");
		}
		if (where) {
			sql.all(`SELECT ${columns} FROM ${table} WHERE ${where}`).then(response => {
				resolve(response);
			}).catch(e => {
				reject(e);
			});
		} else {
			sql.all(`SELECT ${columns} FROM ${table}`).then(response => {
				resolve(response);
			}).catch(e => {
				reject(e);
			});
		}
	});
};

var del = function(table, where) {
	return new Promise((resolve, reject) => {
		sql.run(`DELETE FROM ${table} WHERE ${where}`).then(() => {
			resolve();
		}).catch(err => {
			reject(err);
		});
	});
};

var update = function(table, info, where) {
	return new Promise((resolve, reject) => {
		sql.run(`UPDATE ${table} SET ${info} WHERE ${where}`).then(() => {
			resolve();
		}).catch(err => {
			reject(err);
		});
	});
};

var insert = function(table, info) {
	return new Promise((resolve, reject) => {
		if (typeof info !== "object") {
			reject(new Error("Info must be an array."));
		}
		var columns = Object.keys(info);
		var colNames = columns.join(", ");
		var values = [];
		var ques = "";
		var i = 0;
		for (i; i < columns.length; i++) {
			values.push(info[`${columns[i]}`]);
			if (i === 0) {
				ques = "?";
			} else {
				ques += ", ?";
			}
		}
		sql.run(`INSERT INTO ${table} (${colNames}) VALUES (${ques})`, values).then(() => {
			resolve();
		}).catch(err => {
			reject(err);
		});
	});
};

var query = function(q) {
	return new Promise((resolve, reject) => {
		if (q.split(" ")[0].toLowerCase() === "select") {
			sql.all(q).then(response => {
				resolve(response);
			}).catch(err => {
				reject(err);
			});
		} else {
			sql.run(q).then(() => {
				resolve();
			}).catch(err => {
				reject(err);
			});
		}
	});
};


module.exports = {
	select,
	del,
	update,
	insert,
	query
};
