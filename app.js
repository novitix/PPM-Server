let ip = require('ip');
const express = require('express');
var db = require('./dbHandler');
const app = express();
const port = process.env.PORT || 80;

var routes = require('./routes');
app.use('/', routes);

console.log("PPM Server - v1.1");

app.listen(port, () => {
    console.log(`Listening at ${ip.address()}:${port}`);
});

// Webpage
app.get('/', (req, res) => {
    res.sendFile('landingpage/index.html', {root: __dirname})
});

 process.on('SIGINT', () => {
    db.close();
});

