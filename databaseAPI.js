'use strict';

let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database("./cdm.db");

module.exports = (function() {

    let CREATE_TABLE_USER = 
                "CREATE TABLE IF NOT EXISTS users (" +
                " id            INTEGER     PRIMARY KEY AUTOINCREMENT   , " + 
                " firebase_uid  TEXT                                    , " + 
                " username      TEXT                                    , " + 
                " email         TEXT                                    ) " ; 

    let CREATE_TABLE_TOKENS = 
                "CREATE TABLE IF NOT EXISTS tokens (" +
                " id                INTEGER                 , " +
                " instance_token    TEXT          UNIQUE    ) " ;

    let CREATE_TABLE_MESSAGES = 
                "CREATE TABLE IF NOT EXISTS messages ("     +
                " content       TEXT                    , " +
                " sender        INTEGER                 , " + 
                " receiver      INTEGER                 , " +
                " sent_time     INTEGER                 ) " ; 

    let CREATE_TABLE_CONTACTS =
                "CREATE TABLE IF NOT EXISTS contacts ("     +
                " user_id       INTEGER                 , " + 
                " friend_id     INTEGER                 , " +
                " blocked       BOOLEAN                 , " +
                " UNIQUE( user_id, friend_id )          ) " ;

    db.serialize(function() {
        db.run(CREATE_TABLE_USER);
        db.run(CREATE_TABLE_TOKENS);
        db.run(CREATE_TABLE_MESSAGES);
        db.run(CREATE_TABLE_CONTACTS);
    })

    function insertUser(uid, instanceToken, username, email) {
        return new Promise(function(resolve, reject) {
            let userSql = "INSERT INTO users (firebase_uid, email, username) VALUES (?, ?, ?)";
            let tokenSql = "INSERT INTO tokens (id, instance_token) values (?, ?)";
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
                resolve(userId)
            });
        });
    }

    function insertOrUpdateUser (uid, instanceToken, username, email) {
        let sql = "SELECT id FROM users WHERE firebase_uid = ? ";
        return new Promise(function(resolve, reject) {
            db.get(sql, [uid], function(err, row) {
                console.log("row = ", row);
                if(err) {
                    reject(err);
                    console.log("err in insertOrUpdate = ", err);
                }
                if(row) {
                    // User exists
                    insertToken(row.id, instanceToken)
                        .then(_ => resolve(row.id))
                        .catch(e => reject(e));
                } else {
                    // User does not exist
                    insertUser(uid, instanceToken, username, email)
                        .then(userId => resolve(userId))
                        .catch(e => reject(e));
                }
            })
        });
    }

    function insertToken(userId, instanceToken) {
        return new Promise(function(resolve, reject) {
            let sql = "INSERT OR IGNORE INTO tokens (id, instance_token) values (?, ?)";
            db.run(sql, [userId, instanceToken], function(err) {
                if(err) reject(err);
                resolve();
            })
        });
    }

    function getInstanceTokens (userId) {
        return new Promise(function(resolve, reject) {
            let sql = "SELECT instance_token FROM tokens WHERE id = ?";
            db.all(sql, [userId], function(err, rows) {
                if(err) reject(err);
                resolve(rows.map(row => row.instance_token));
            });
        });
    }

    function insertMessage (content, senderId, receiverId, sentTime) {
        return new Promise(function(resolve, reject) {
            let sql = "INSERT INTO messages (content, sender, receiver, sent_time)" + 
                        " VALUES (?, ?, ?, ?)";
            db.run(sql, [content, senderId, receiverId, sentTime], function(err) {
                if(err) reject(err);
                resolve();
            })
        });
    }

    function searchForContact (searchString) {
        return new Promise(function(resolve, reject) {
            let sql = "SELECT id, username FROM users WHERE username = ?";
            db.get(sql, searchString, function(err,row) {
                if(err) reject(err);
                resolve(row);
            });
        });
    }

    function addContact (adderId, addedId) {
        return new Promise(function(resolve, reject) {
            let sql = "INSERT INTO contacts (user_id, friend_id, blocked) values (?, ?, 'false')";
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

    function blockContact (blockerId, bockedId) { return setBLocked(blockerId, blockedId, false);};

    function unblockContact (blockerId, bockedId) { return setBLocked(blockerId, blockedId, true);};

    function deleteContact (deleterId, deletedId) {
        return new Promise(function(resolve, reject) {
            let sql = "DELETE FROM contacts WHERE user_id = ? AND friend_id = ?";
            db.run(sql, [deleterId, deletedId], function(err) {
                if(err) reject(err);
                resolve();
            })
        });
    }

    return {
        deleteContact : deleteContact,
        blockContact : blockContact,
        addContact : addContact,
        searchForContact : searchForContact,
        insertMessage : insertMessage,
        insertOrUpdateUser : insertOrUpdateUser,
        getInstanceTokens : getInstanceTokens
    }
})();
