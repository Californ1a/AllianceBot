//const connection = require("./sqlmanager.js");
const sql = require("./sqlmanager.js");
const colors = require("colors");
//sql.open("./alliancebot.sqlite");
const log = (m, i) => {
	console.log(`DATABASE: ${colors.cyan(m)}${(i) ? ` ${colors.cyan(JSON.stringify(i, null, "\t"))}` : ""}`);
};

const select = function(columns, table, where) {
	return new Promise((resolve, reject) => {
		if (typeof columns === "object") {
			columns = columns.join(", ");
		}
		log(`SELECT ${columns} FROM ${table}${(where) ? ` WHERE ${where}` : ""}`);
		sql.query(`SELECT ${columns} FROM ${table}${(where) ? ` WHERE ${where}` : ""}`, (err, response) => {
			if (err) {
				reject(err);
			}
			resolve(response);
		});
	});
};

const del = function(t1, table, where) {
	return new Promise((resolve, reject) => {
		if (where) {
			log(`DELETE ${t1} FROM ${table} WHERE ${where}`);
			sql.query(`DELETE ${t1} FROM ${table} WHERE ${where}`, (err) => {
				if (err) {
					reject(err);
				}
				resolve();
			});
		} else {
			log(`DELETE FROM ${t1} WHERE ${table}`);
			sql.query(`DELETE FROM ${t1} WHERE ${table}`, (err) => {
				if (err) {
					reject(err);
				}
				resolve();
			});
		}
	});
};

const update = function(table, info, where) {
	return new Promise((resolve, reject) => {
		log(`UPDATE ${table} SET ${info} WHERE ${where}`);
		sql.query(`UPDATE ${table} SET ${info} WHERE ${where}`, (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
};

const insert = function(table, info) {
	return new Promise((resolve, reject) => {
		if (typeof info !== "object") {
			reject(new Error("Info must be an object."));
		}
		log(`INSERT INTO ${table} SET ?`, info);
		sql.query(`INSERT INTO ${table} SET ?`, info, (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
};

const query = function(q) {
	return new Promise((resolve, reject) => {
		if (q.split(" ")[0].toLowerCase() === "select") {
			log(q);
			sql.query(q, (err, response) => {
				if (err) {
					reject(err);
				}
				resolve(response);
			});
		} else {
			log(q);
			sql.query(q, (err) => {
				if (err) {
					reject(err);
				}
				resolve();
			});
		}
	});
};

const servers = "CREATE TABLE IF NOT EXISTS servers (idservers INT(11) NOT NULL AUTO_INCREMENT, servername VARCHAR(512) NOT NULL, serverid VARCHAR(45) NOT NULL, ownerid VARCHAR(45) NOT NULL, prefix VARCHAR(45) NOT NULL, membrole VARCHAR(255) NULL DEFAULT NULL, modrole VARCHAR(255) NULL DEFAULT NULL, adminrole VARCHAR(255) NULL DEFAULT NULL, timeoutrole VARCHAR(255) NULL DEFAULT NULL, logchannel VARCHAR(120) NULL DEFAULT NULL, twitchgame VARCHAR(255) NULL DEFAULT NULL, twitchchannel VARCHAR(120) NULL DEFAULT NULL, PRIMARY KEY (idservers), UNIQUE INDEX serverid_UNIQUE (serverid)) COLLATE='utf8mb4_general_ci' ENGINE=InnoDB";

const commands = "CREATE TABLE IF NOT EXISTS commands (idcommands INT(11) NOT NULL AUTO_INCREMENT, commandname VARCHAR(50) NOT NULL, server_id VARCHAR(45) NOT NULL, PRIMARY KEY (idcommands), UNIQUE INDEX id_command_unique (commandname, server_id), INDEX commands_ibfk_1 (server_id), CONSTRAINT commands_ibfk_1 FOREIGN KEY (server_id) REFERENCES servers (serverid) ON UPDATE NO ACTION ON DELETE NO ACTION) COLLATE='utf8mb4_general_ci' ENGINE=InnoDB";

const servcom = "CREATE TABLE IF NOT EXISTS servcom (idservcom INT(11) NOT NULL AUTO_INCREMENT, comname VARCHAR(45) NOT NULL, comtext MEDIUMTEXT NULL, inpm VARCHAR(5) NOT NULL DEFAULT 'false', permlvl INT(2) NOT NULL DEFAULT '0', type VARCHAR(20) NOT NULL DEFAULT 'simple', server_id VARCHAR(45) NOT NULL, PRIMARY KEY (idservcom), UNIQUE INDEX id_com_servid (comname, server_id), INDEX servcom_ibfk_1 (server_id), CONSTRAINT servcom_ibfk_1 FOREIGN KEY (server_id) REFERENCES servers (serverid) ON UPDATE NO ACTION ON DELETE NO ACTION) COLLATE='utf8mb4_general_ci' ENGINE=InnoDB";

const triviascore = "CREATE TABLE IF NOT EXISTS triviascore (idtriviascore INT(11) NOT NULL AUTO_INCREMENT, userid VARCHAR(45) NOT NULL, score INT(4) NOT NULL, server_id VARCHAR(45) NOT NULL, PRIMARY KEY (idtriviascore), UNIQUE INDEX id_user_unique (userid, server_id), INDEX rip_ibfk_1_idx (server_id), CONSTRAINT triviascore_ibfk_1 FOREIGN KEY (server_id) REFERENCES servers (serverid) ON UPDATE NO ACTION ON DELETE NO ACTION) COLLATE='utf8mb4_general_ci' ENGINE=InnoDB";

const giveaway = "CREATE TABLE IF NOT EXISTS giveaway (idgive INT(11) NOT NULL AUTO_INCREMENT, entries INT(5) NOT NULL, cost INT(5) NOT NULL, server_id VARCHAR(45) NOT NULL, PRIMARY KEY (idgive), UNIQUE INDEX serverid_unique (server_id), CONSTRAINT giveaway_ibfk_1 FOREIGN KEY (server_id) REFERENCES servers (serverid) ON UPDATE NO ACTION ON DELETE NO ACTION) COLLATE='utf8mb4_general_ci' ENGINE=InnoDB";

const giveusers = "CREATE TABLE IF NOT EXISTS giveusers (idgive INT(11) NOT NULL AUTO_INCREMENT, userid VARCHAR(45) NOT NULL, likelihood INT(4) NOT NULL, giveawayid INT(11) NULL DEFAULT NULL, PRIMARY KEY (idgive), UNIQUE INDEX user_unique (userid, giveawayid), INDEX giveusers_ibfk_1 (giveawayid), CONSTRAINT giveusers_ibfk_1 FOREIGN KEY (giveawayid) REFERENCES giveaway (idgive) ON UPDATE CASCADE ON DELETE CASCADE) COLLATE='utf8mb4_general_ci' ENGINE=InnoDB";

const lockdown = "CREATE TABLE IF NOT EXISTS lockdown (lockdownid INT(11) NOT NULL AUTO_INCREMENT, server_id VARCHAR(45) NOT NULL, channel_id VARCHAR(45) NOT NULL, role_id VARCHAR(45) NULL DEFAULT NULL, startdate DATETIME NOT NULL, enddate DATETIME NOT NULL, PRIMARY KEY (lockdownid), INDEX lockdown_ibfk_1_idx (server_id), CONSTRAINT lockdown_ibfk_1 FOREIGN KEY (server_id) REFERENCES servers (serverid) ON UPDATE NO ACTION ON DELETE CASCADE) COLLATE='utf8mb4_general_ci' ENGINE=InnoDB";

const reminders = "CREATE TABLE IF NOT EXISTS reminders (id INT(11) NOT NULL AUTO_INCREMENT, userid VARCHAR(50) NOT NULL, message TEXT NOT NULL, sent VARCHAR(5) NOT NULL DEFAULT 'false', reminddate DATETIME NOT NULL, initdate DATETIME NOT NULL, INDEX id (id)) COLLATE='utf8mb4_general_ci' ENGINE=InnoDB";

const createAllTables = function() { //because I built too much database stuff without first checking in the proper places if the tables exist
	return new Promise((resolve, reject) => {
		console.log(colors.red("Checking if SQL tables exist..."));
		query(servers).then(() => {
			Promise.all([query(commands), query(servcom), query(triviascore), query(giveaway), query(giveusers), query(lockdown), query(reminders)]).then(() => {
				console.log(colors.red("All tables exist or were created."));
				resolve();
			}).catch(e => {
				reject(e);
			});
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
