var express = require('express')
var songController = require('./songController');
var sessionController = require('./sessionController');
var router = express.Router();

const bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

/**
 * Route which returns the last session's ID. Used in conjunction with create session.
 */
router.route('/api/session/last-session-id').get(sessionController.getLastSession);

/**
 * Route which returns the song id for the current session. sends 304 not modified status if it has not changed
 */
 router.route('/api/session/get-session-changes').get(sessionController.getSessionChanges);

/**
 * Changes to the session are pushed here.
 */
router.use('/api/session/update-session', jsonParser);
router.route('/api/session/update-session').post(sessionController.updateSession);

/**
 * Client sends a session code and the server responds with whether or not the code exists.
 */
router.route('/api/session/get-session-exists').get(sessionController.checkSessionExists);

// Session Handling
router.route('/api/session/create-session').post(sessionController.createSession);



router.route('/api/songs/get-song').get(songController.getSong);

router.route('/api/songs/search').get(songController.search);

module.exports = router;