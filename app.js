let ip = require('ip');
let SqlString = require('sqlstring');
const express = require('express');
const app = express();
const port = process.env.PORT || 80;
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
let sqlite = require('sqlite3').verbose();

console.log("PPM Server - v1.1");

let db = new sqlite.Database('./database.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) console.log('Database Open Error', err.message);
    console.log('DB Connection opened successfully');
});



app.listen(port, () => {
    console.log(`Listening at ${ip.address()}:${port}`);
});

app.get('/api/songs', (req, res) => {
    switch(Object.keys(req.query)[0]) {
        case 'id':
            SendBodyById(req.query.id,res);
            break;
        case 'number':
            SendInfoByNumber(req.query.number,res);
            break;
        case 'filter':
            SendInfoByFilter(req.query.filter, res);
            break;
    }
});

function SendBodyById(id, res) {
    db.get(`SELECT Body
    FROM Songs
    WHERE (ID = ?);`,[id], (err, item) => {
        console.log(err ? err.message : 'Query by ID successful');
        //console.log('sent', item)
        res.send(item);
        return;
    });
}

function SendInfoByNumber(number, res) {
    db.all(`SELECT ID,
            Title,
            Number,
            Key
        FROM Songs
        WHERE (Number = $number);`, {$number: number}, (err, items) => {
            console.log(err ? err.message : 'Query by number successful');
            res.send(items);
            return;
            });
}

/**
 * Searches records in the Songs table containing the filter string and sends the first 10 found records using the provided res object.
 * @param {string} filter 
 * @param {object} res 
 */
function SendInfoByFilter(filter, res) {
    max_rows = 10
    let sql = SqlString.format("SELECT ID, Title, Number, Key FROM Songs WHERE Body LIKE ? LIMIT ?;", ['%' + filter + '%', max_rows]);
    //console.log(sql);

    db.all(sql, (err, items) => {
            console.log(err ? err.message : 'Query by filter successful');
            res.send(items);
            return;
            });
}

// Session Handling
app.post('/api/session/create-session', (req, res) => {
    CreateSessionId();
    res.end("Added session");
});

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

/**
 * Route which returns the last session's ID. Used in the API in conjunction with create session.
 */
app.get('/api/session/last-session-id', (req, res) => {
    let sql = SqlString.format("SELECT SessionCode FROM Session ORDER BY ID DESC LIMIT 1");
    db.get(sql, (err, item) => {
        res.send(item.SessionCode.toString());
    });
});

/**
 * Route which returns the song id for the current session. sends 304 not modified status if it has not changed
 */
app.get('/api/session/get-session-changes', (req, res) => {
    let sql = SqlString.format("SELECT SongID FROM Session WHERE SessionCode = ? LIMIT 1", [req.query.code]);
    db.get(sql, (err, item) => {
        if (req.query.id.toString() == item.SongID.toString()) {
            res.status(304);
            res.send("");
        } else {
            res.send(item.SongID.toString());
        }
    });
});

/**
 * Changes to the session are pushed here.
 */
app.post('/api/session/update-session', jsonParser, (req, res) => {
    let sql = SqlString.format("UPDATE Session SET SongID = ? WHERE SessionCode = ?;", [req.body.songId, req.body.sessionCode]);
    db.run(sql);
    console.log("Update Session " + req.body.sessionCode + " with Id " + req.body.songId);
    res.end("Updated session");
});

process.on('SIGINT', () => {
    db.close();
});