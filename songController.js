let SqlString = require('sqlstring');
var db = require('./dbHandler');
const MAX_SEARCH_ROWS = 25;

module.exports = {
    getSong : function(req, res) {
        if (Object.keys(req.query)[0] == "id") {
            SendSongById(req.query.id,res);
        }
    },

    search : function(req, res) {
        switch(Object.keys(req.query)[0]) {
            case 'number':
                SearchBySongNumber(req.query.number,res);
                break;
            case 'filter':
                SearchByFilter(req.query.filter, res);
                break;
        }
    }
}

/**
 * Searches records in the Songs table with the sogn number and sends the first 10 found records using the provided res object.
 * @param {string} filter 
 * @param {object} res z
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