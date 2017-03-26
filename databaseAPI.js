let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Dtabase("./cdm.db");

let CREATE_TABLE_USER = 
            "CREATE TABLE IF NOT EXISTS users (" +
            " id AUTOINCREMENT INTEGER PRIMARY KEY," + 
            " firebase_uid TEXT ," + 
            " username TEXT " + 
            " email TEXT )"; 

let CREATE_TABLE_TOKENS = 
            "CREATE TABLE IF NOT EXISTS tokens (" +
            " id INTEGER PRIMARY KEY, " +
            " instance_token TEXT )" +

let CREATE_TABLE_MESSAGES = 
            "CREATE TABLE IF NOT EXISTS messages (" +
            " content TEXT, " +
            " sender INTEGER, " + 
            " receiver INTEGER, " +
            " sent_time INTEGER )"; 

let CREATE_TABLE_CONTACTS =
            "CREATE TABLE IF NOT EXISTS contacts (" +
            " user_id INTEGER PRIMARY KEY, " + 
            " friend_id INTEGER"
            " blocked BOOLEAN )";

db.run(CREATE_TABLE_MESSAGES);
db.run(CREATE_TABLE_CONTACTS);
db.run(CREATE_TABLE_USER);
db.run(CREATE_TABLE_TOKENS);

function insertUser(uid, instanceToken, username, email) {
	return new Promise(function(resolve, reject) {
		let userSql = "INSERT INTO users (firebase_uid, email, username) VALUES (?, ?, ?)";
		let tokenSql = "INSERT INTO tokens (id, token) values (?, ?)";
		var userId;
		db.serialize(function() {
			db.run("BEGIN");
			db.run(userSql, [uid, email, username], function(err) {
				if(err) {
					reject(err)
				}
				userId = this.lastID;
				db.run(tokenSql, [userId, instanceToken], function(err) {
					if(err) {
						db.run("ROLLBACK");
						reject(err);
					}
				});
			});
			db.run("COMMIT");
		}
	});
}

function insertToken(userId, instanceToken) {
	return new Promise(function(resolve, reject) {
		let sql = "INSERT INTO tokens (id, instance_token) values (?, ?)";
		db.run(sql, [userId, instanceToken], function(err) {
			if(err) reject(err);
			resolve(inserToken)
		})
	});
}

module.exports.insertOrUpdateUser = function(uid, instanceToken, username, email) {
    let sql = "SELECT EXISTS ( SELECT id FROM users WHERE firebase_uid = ? LIMIT 1 )";
    return new Promise(function(resolve, reject) {
        db.get(sql, [uid], function(err, row) {
        	if(err) reject(err);
        	if (row === 0) 
        		resolve(insertUser(uid, instanceToken, username, email));
        	else {
        		resolve(updateUser(uid, instanceToken, username, email));
        	}
        })
    });  
}

module.exports.insertMessage = function(content, senderId, receiverId, sentTime) {
	return new Promise(function(resolve, reject) {
		let sql = "INSERT INTO messages (content, sender, receiver, sent_time)" + 
					" VALUES (?, ?, ?, ?)";
		db.run(sql, [content, senderId, receiverId, sentTime], function(err) {
			if(err) reject(err);
			resolve();
		})
	});
}

module.exports.searchForContact = function(searchString) {
	return new Promise(function(resolve, reject) {
		let sql = "SELECT id, username FROM users WHERE username = ?";
		db.get(sql, searchString, function(err,row) {
			if(err) reject(err);
			resolve(row);
		});
	});
}

module.exports.addContact = function(adderId, addedId) {
	return new Promise(function(resolve, reject) {
		let sql = "INSERT INTO contacts (user_id, friend_id, blocked) values (?, ?, false)";
		db.run(sql, [adderId, addedId], function(err) {
			if(err) reject(err);
			resolve();
		});
	});
}

function setBlocked(blockerId, bockedId, blockState) {
	return new Promise(function(resolve, reject) {
		let sql = "UPDATE contacts SET blocked = ? WHERE user_id=? AND friend_id = ?";
		db.run(sql, [blockerId, blockedId, blockedState], function(err) {
			if(err) reject(err);
			resolve();
		})
	});
}

module.exports.blockContact = function(blockerId, bockedId) { return setBLocked(blockerId, blockedId, false);};
module.exports.unblockContact = function(blockerId, bockedId) { return setBLocked(blockerId, blockedId, true);};

module.exports.deleteContact = function(deleterId, deletedId) {
	return new Promise(function(resolve, reject) {
		let sql = "DELETE FROM contacts WHERE user_id = ? AND friend_id = ?";
		db.run(sql, [deleterId, deletedId], function(err) {
			if(err) reject(err);
			resolve();
		})
	});
}
