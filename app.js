let ip = require('ip');
const express = require('express');
var db = require('./dbHandler');
const app = express();
const port = process.env.PORT || 80;
var routes = require('./routes');
const { SERVER_VERSION } = require('./serviceController');
app.use('/', routes);

console.log(`PPM Server - v${SERVER_VERSION}`);

app.listen(port, () => {
    console.log(`Listening at ${ip.address()}:${port}`);
});





process.on('SIGINT', () => {
    db.close();
});