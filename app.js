let ip = require('ip');
const express = require('express');
var db = require('./dbHandler');
const app = express();
const port = process.env.PORT || 80;
const SERVER_VERSION = "1.2";
var routes = require('./routes');
app.use('/', routes);

console.log(`PPM Server - v${SERVER_VERSION}`);

app.listen(port, () => {
    console.log(`Listening at ${ip.address()}:${port}`);
});


// Webpage
app.get('/', (req, res) => {
    res.sendFile('landingpage/index.html', {root: __dirname})
});

// Version checking
app.get('/api/version', (req, res) => {
    console.log("Sent server version")
    res.send(SERVER_VERSION);
});


 process.on('SIGINT', () => {
    db.close();
});

