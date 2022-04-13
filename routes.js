var express = require('express')
var songController = require('./songController');
var sessionController = require('./sessionController');
var serviceController = require('./serviceController')
var router = express.Router();

const bodyParser = require('body-parser');
const { sendAndroidPlayStoreLink } = require('./serviceController');
var jsonParser = bodyParser.json();



// SONG HANDLING

/**
 * Takes an ID and returns the song's data (Title, Body, Key, etc).
 */
 router.route('/api/songs/get-song').get(songController.getSong);

 /**
  * Takes a filter and returns the a list of matching songs with their (ID, Title, Number, Key).
  */
 router.route('/api/songs/search').get(songController.search);




// SESSION HANDLING

/**
 * Route which returns the last session's ID. Used in conjunction with create session.
 */
router.route('/api/session/last-session-id').get(sessionController.getLastSession);

/**
 * Route which returns the song id for the current session. sends 304 not modified status if it has not changed
 */
 router.route('/api/session/get-session-song-id').get(sessionController.getSessionSongId);

/**
 * Changes to the session are pushed here.
 */
router.use('/api/session/update-session', jsonParser);
router.route('/api/session/update-session').post(sessionController.updateSession);

/**
 * Client sends a session code and the server responds with whether or not the code exists.
 */
router.route('/api/session/check-session-exists').get(sessionController.checkSessionExists);

/**
 * Creates a new session code in the database.
 */
router.route('/api/session/create-session').post(sessionController.createSession);



// SERVICE HANDLING
router.route('/').get(serviceController.sendWebpage);
router.route('/api/version').get(serviceController.sendVersion);
router.route('/android-play-store').get(serviceController.sendAndroidPlayStoreLink);
router.route('/ios-app-store').get(serviceController.sendiOSAppStoreLink);


module.exports = router;