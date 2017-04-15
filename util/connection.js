//const connection = require("./sqlmanager.js");
const sql = require("./sqlmanager.js");
//sql.open("./alliancebot.sqlite");

var select = function(columns, table, where) {
	return new Promise((resolve, reject) => {
		if (typeof columns === "object") {
			columns = columns.join(", ");
		}
		if (where) {
			sql.query(`SELECT ${columns} FROM ${table} WHERE ${where}`, (err, response) => {
				if (err) {
					reject(err);
				}
				resolve(response);
			});
		} else {
			sql.query(`SELECT ${columns} FROM ${table}`, (err, response) => {
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
		sql.query(`DELETE FROM ${table} WHERE ${where}`, (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
};

var update = function(table, info, where) {
	return new Promise((resolve, reject) => {
		sql.query(`UPDATE ${table} SET ${info} WHERE ${where}`, (err) => {
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
			reject(new Error("Info must be an object."));
		}
		sql.query(`INSERT INTO ${table} SET ?`, info, (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
};

var query = function(q) {
	return new Promise((resolve, reject) => {
		if (q.split(" ")[0].toLowerCase() === "select") {
			sql.query(q, (err, response) => {
				if (err) {
					reject(err);
				}
				resolve(response);
			});
		} else {
			sql.query(q, (err) => {
				if (err) {
					reject(err);
				}
				resolve();
			});
		}
	});
};

var createAllTables = function() { //because I built too much database stuff without first checking in the proper places if the tables exist
	return new Promise((resolve, reject) => {
		console.log("Checking if SQL tables exist...");
		query("CREATE TABLE IF NOT EXISTS servers (idservers integer NOT NULL, ownerid varchar (45) NOT NULL, servername varchar (512) NOT NULL, prefix varchar (45) NOT NULL, serverid varchar (45) NOT NULL, membrole varchar (255), modrole varchar (255), adminrole varchar (255), PRIMARY KEY(idservers))").then(() => {
			query("CREATE TABLE IF NOT EXISTS advent (idadvent integer NOT NULL, server_id varchar (45) NOT NULL, time varchar (19) NOT NULL, name varchar (255) NOT NULL, PRIMARY KEY(idadvent))");
		}).then(() => {
			query("CREATE TABLE IF NOT EXISTS commands (idcommands integer NOT NULL, server_id varchar (45) NOT NULL, commandname varchar (50) NOT NULL, PRIMARY KEY(idcommands))");
		}).then(() => {
			query("CREATE TABLE IF NOT EXISTS hype (idhype integer NOT NULL, quote varchar (1000) NOT NULL, server_id varchar (45) NOT NULL, PRIMARY KEY(idhype))");
		}).then(() => {
			query("CREATE TABLE IF NOT EXISTS rip (idrip integer NOT NULL, server_id varchar (45) NOT NULL, quote varchar (255) NOT NULL, PRIMARY KEY(idrip))");
		}).then(() => {
			query("CREATE TABLE IF NOT EXISTS servcom (idservcom integer NOT NULL, server_id varchar (45) NOT NULL, inpm varchar (5) NOT NULL DEFAULT 'false', permlvl integer NOT NULL DEFAULT 0, comname varchar (45) NOT NULL, comtext varchar (1000) NOT NULL, PRIMARY KEY(idservcom))");
		}).then(() => {
			query("CREATE TABLE IF NOT EXISTS sign (idsign integer NOT NULL, quote varchar (200) NOT NULL, server_id varchar (45) NOT NULL, PRIMARY KEY(idsign))");
		}).then(() => {
			query("CREATE TABLE IF NOT EXISTS tf (idtf integer NOT NULL, server_id varchar (45) NOT NULL, quote varchar (45) NOT NULL, PRIMARY KEY(idtf))");
		}).then(() => {
			query("CREATE TABLE IF NOT EXISTS triviascore (idtriviascore integer NOT NULL, server_id varchar (45) NOT NULL, score integer NOT NULL, userid varchar (45) NOT NULL, PRIMARY KEY(idtriviascore))");
		}).then(() => {
			query("CREATE TABLE IF NOT EXISTS win (idwin integer NOT NULL, quote varchar (255) NOT NULL, server_id varchar (45) NOT NULL, PRIMARY KEY(idwin))");
		}).then(() => {
			query("CREATE TABLE IF NOT EXISTS giveaway (idgive integer NOT NULL, running varchar (5) NOT NULL DEFAULT 'false', server_id varchar (45) NOT NULL, PRIMARY KEY(idgive))");
		}).then(() => {
			console.log("All tables exist or were created.");
			resolve();
		}).catch(e => {
			reject(e);
		});
	});
};


module.exports = {
	select,
	del,
	update,
	insert,
	query,
	createAllTables
};
