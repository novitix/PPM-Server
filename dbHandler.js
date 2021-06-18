const express = require('express');
let sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('./database.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) console.log('Database Open Error', err.message);
    console.log('DB Connection opened successfully');
});
module.exports = db;