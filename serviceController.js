let SqlString = require('sqlstring');
const SERVER_VERSION = '1.3.0';
const PLAY_STORE_LINK = 'https://play.google.com/store/apps/details?id=com.companyname.projectorpromobile&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'
const APP_STORE_LINK = 'https://www.google.com/'

module.exports = {
    sendWebpage : function(req, res) {
        res.sendFile('landingpage/index.html', {root: __dirname})
    },

    sendVersion : function(req, res) {
        console.log("Sent server version")
        res.send(SERVER_VERSION);
    },

    sendAndroidPlayStoreLink : function(req, res) {
        res.send(PLAY_STORE_LINK);
    },

    sendiOSAppStoreLink : function(req, res) {
        res.send(APP_STORE_LINK); // TODO
    },

    SERVER_VERSION
}