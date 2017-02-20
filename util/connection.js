const connection = require("./sqlmanager.js");

var select = function(columns, table, where) {
	return new Promise((resolve, reject) => {
		if (typeof columns === "object") {
			columns = columns.join(", ");
		}
		if (where) {
			connection.query(`SELECT ${columns} FROM ${table} WHERE ${where}`, (err, response) => {
				if (err) {
					reject(err);
				}
				resolve(response);
			});
		} else {
			connection.query(`SELECT ${columns} FROM ${table}`, (err, response) => {
				if (err) {
					reject(err);
				}
				resolve(response);
			});
		}
	});
};

var del = function(table, where) {
	return new Promise((resolve, reject) => {
		connection.query(`DELETE FROM ${table} WHERE ${where}`, (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
};

var update = function(table, info, where) {
	return new Promise((resolve, reject) => {
		connection.query(`UPDATE ${table} SET ${info} WHERE ${where}`, (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
};

var insert = function(table, info) {
	return new Promise((resolve, reject) => {
		if (typeof info !== "object") {
			var e = {stack: "Info must be an array."};
			reject(e);
		}
		connection.query(`INSERT INTO ${table} SET ?`, info, (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
};

var query = function(q) {
	return new Promise((resolve, reject) => {
		connection.query(q, (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
};


module.exports = {
	select,
	del,
	update,
	insert,
	query
};
