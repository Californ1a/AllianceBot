//const connection = require("./sqlmanager.js");
const sql = require("sqlite");
sql.open("./alliancebot.sqlite");

var createAllTables = function() { //because I built too much database stuff without first checking in the proper places if the tables exist
	return new Promise((resolve, reject) => {
		console.log("Checking if SQLite tables exist...");
		sql.run("CREATE TABLE IF NOT EXISTS servers (idservers integer NOT NULL, ownerid varchar (45) NOT NULL, servername varchar (512) NOT NULL, prefix varchar (45) NOT NULL, serverid varchar (45) NOT NULL, membrole TEXT, modrole TEXT, adminrole TEXT, PRIMARY KEY(idservers))").then(() => {
			sql.run("CREATE TABLE IF NOT EXISTS advent (server_id varchar (45) NOT NULL, time varchar (19) NOT NULL, idadvent integer NOT NULL, name varchar (255) NOT NULL, PRIMARY KEY(idadvent), FOREIGN KEY(server_id) REFERENCES servers(serverid) ON DELETE NO ACTION ON UPDATE NO ACTION)");
		}).then(() => {
			sql.run("CREATE TABLE IF NOT EXISTS commands (server_id varchar (45) NOT NULL, idcommands integer NOT NULL, commandname varchar (50) NOT NULL, FOREIGN KEY(server_id) REFERENCES servers(serverid), PRIMARY KEY(idcommands))");
		}).then(() => {
			sql.run("CREATE TABLE IF NOT EXISTS hype (quote varchar (1000) NOT NULL, server_id varchar (45) NOT NULL, idhype integer NOT NULL, PRIMARY KEY(idhype), FOREIGN KEY(server_id) REFERENCES servers(serverid) ON DELETE NO ACTION ON UPDATE NO ACTION)");
		}).then(() => {
			sql.run("CREATE TABLE IF NOT EXISTS rip (idrip integer NOT NULL, server_id varchar (45) NOT NULL, quote varchar (255) NOT NULL, PRIMARY KEY(idrip), FOREIGN KEY(server_id) REFERENCES servers(serverid) ON DELETE NO ACTION ON UPDATE NO ACTION)");
		}).then(() => {
			sql.run("CREATE TABLE IF NOT EXISTS servcom (server_id varchar ( 45 ) NOT NULL, inpm varchar (5) NOT NULL DEFAULT 'false', permlvl integer NOT NULL DEFAULT 0, comname varchar (45) NOT NULL, comtext varchar (1000) NOT NULL, idservcom integer NOT NULL, FOREIGN KEY(server_id) REFERENCES servers(serverid) ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY(idservcom))");
		}).then(() => {
			sql.run("CREATE TABLE IF NOT EXISTS sign (quote varchar (200) NOT NULL, idsign integer NOT NULL, server_id varchar (45) NOT NULL, PRIMARY KEY(idsign))");
		}).then(() => {
			sql.run("CREATE TABLE IF NOT EXISTS tf (idtf integer NOT NULL, server_id varchar (45) NOT NULL, quote varchar (45) NOT NULL, FOREIGN KEY(server_id) REFERENCES servers(serverid) ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY(idtf))");
		}).then(() => {
			sql.run("CREATE TABLE IF NOT EXISTS triviascore (idtriviascore integer NOT NULL, server_id varchar (45) NOT NULL, score integer NOT NULL, userid varchar (45) NOT NULL, FOREIGN KEY(server_id) REFERENCES servers(serverid) ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY(idtriviascore))");
		}).then(() => {
			sql.run("CREATE TABLE IF NOT EXISTS win (quote varchar (255) NOT NULL, server_id varchar (45) NOT NULL, idwin integer NOT NULL, PRIMARY KEY(idwin), FOREIGN KEY(server_id) REFERENCES servers(serverid) ON DELETE NO ACTION ON UPDATE NO ACTION)");
		}).then(() => {
			console.log("All tables exist or were created.");
			resolve();
		}).catch(e => {
			reject(e);
		});
	});
};

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
	query,
	createAllTables
};
