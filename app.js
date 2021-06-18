let ip = require('ip');
let SqlString = require('sqlstring');
const express = require('express');
const app = express();
const port = process.env.PORT || 2344;
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
let sqlite = require('sqlite3').verbose();

const MAX_SEARCH_ROWS = 25;

console.log("PPM Server - v1.1");

let db = new sqlite.Database('./database.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) console.log('Database Open Error', err.message);
    console.log('DB Connection opened successfully');
});


app.listen(port, () => {
    console.log(`Listening at ${ip.address()}:${port}`);
});

app.get('/', (req, res) => {
    res.sendFile('landingpage/index.html', {root: __dirname})
});


app.get('/api/songs/search', (req, res) => {
    switch(Object.keys(req.query)[0]) {
        case 'number':
            SearchBySongNumber(req.query.number,res);
            break;
        case 'filter':
            SearchByFilter(req.query.filter, res);
            break;
    }
});

/**
 * Searches records in the Songs table with the sogn number and sends the first 10 found records using the provided res object.
 * @param {string} filter 
 * @param {object} res 
 */
function SearchBySongNumber(number, res) {
    let sql = SqlString.format("SELECT ID, Title, Number, Key FROM Songs WHERE (Number = ?) LIMIT ?;", [number, MAX_SEARCH_ROWS]);
    db.all(sql, (err, items) => {
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
function SearchByFilter(filter, res) {
    let sql = SqlString.format("SELECT ID, Title, Number, Key FROM Songs WHERE Body LIKE ? LIMIT ?;", ['%' + filter + '%', MAX_SEARCH_ROWS]);

    db.all(sql, (err, items) => {
            console.log(err ? err.message : 'Query by filter successful');
            res.send(items);
            return;
            });
}

app.get('/api/songs/get-song', (req, res) => {
    if (Object.keys(req.query)[0] == "id") {
        SendSongById(req.query.id,res);
    }
});
function SendSongById(id, res) {
    db.get(`SELECT Book, Number, Title, Key, Body
    FROM Songs
    WHERE (ID = ?);`,[id], (err, item) => {
        console.log(err ? err.message : 'Query by ID successful');
        //console.log('sent', item)
        res.send(item);
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
 * Route which returns the last session's ID. Used in conjunction with create session.
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

/**
 * Client sends a session code and the server responds with whether or not the code exists.
 */
app.get('/api/session/get-session-exists', (req, res) => {
    let sql = SqlString.format("SELECT SongID FROM Session WHERE SessionCode = ?;", [req.query.code]);
    db.get(sql, (err, item) => {
        res.send(item != undefined)
    });
});

process.on('SIGINT', () => {
    db.close();
});