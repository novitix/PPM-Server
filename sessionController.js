
let SqlString = require('sqlstring');
var db = require('./dbHandler');

module.exports = {
    getLastSession : function(req, res) {
        let sql = SqlString.format("SELECT SessionCode FROM Session ORDER BY ID DESC LIMIT 1");
        db.get(sql, (err, item) => {
            res.send(item.SessionCode.toString());
        });
    },

    getSessionChanges : function(req, res) {
        let sql = SqlString.format("SELECT SongID FROM Session WHERE SessionCode = ? LIMIT 1", [req.query.code]);
        db.get(sql, (err, item) => {
            if (item == undefined) {
                res.status(400) // session code does not exist
                res.send("");
            }
            if (req.query.id.toString() == item.SongID.toString()) {
                console.log("Returning session changes - Not Modified");
                res.status(304);
                res.send("");
            } else {
                console.log("Returning session changes - Changed ?", [item.SongID.toString()]);
                res.send(item.SongID.toString());
            }
        });
    },

    updateSession : function(req, res) {
        let sql = SqlString.format("UPDATE Session SET SongID = ? WHERE SessionCode = ?;", [req.body.songId, req.body.sessionCode]);
        db.run(sql);
        console.log("Update Session " + req.body.sessionCode + " with Id " + req.body.songId);
        res.end("Updated session");
    },

    checkSessionExists : function (req, res) {
        let sql = SqlString.format("SELECT SongID FROM Session WHERE SessionCode = ?;", [req.query.code]);
        db.get(sql, (err, item) => {
            res.send(item != undefined)
        });
    },

    createSession : function (req, res) {
        CreateSessionId();
        res.end("Added session");
    }
}

/**
 * Generates a random session code and adds it to the database.
 */
function CreateSessionId() {
    let ids = [];
    let sql = SqlString.format("SELECT SessionCode FROM Session");
    db.all(sql, (err, items) => {
        ids.push(items.SessionID)
    });

    let newId = 0; // Random integer between 1000-9999 which is not already in the database
    while (newId == 0 || newId in ids) {
        newId = Math.floor(1000 + Math.random() * 9000);
    }
    sql = SqlString.format("INSERT INTO Session (SessionCode, SongID) VALUES (?, -1);", [newId]);
    db.run(sql, (err) => {
        if (err) {
            console.log(err.message);
        }
        console.log("Inserted new session code: " + newId.toString());
    });
}
