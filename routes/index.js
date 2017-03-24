// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var admin;

module.exports = function(ad) {
	/* GET home page. */
	router.get('/', function(req, res, next) {
		console.log("I got a GET request! :D");

		var userIdToken = req.body.userIdToken;
		verifyIdToken(userIdToken);

		// res.render('index', { title: 'Express' });
		var response = { "response" : "This is a response from the server to a GET request!"};
		res.send(response);
	});

	router.post('/', function(req, res, next) {
		console.log("I got a POST request! :D");

		var userIdToken = req.body.userIdToken;
		verifyIdToken(userIdToken);

		var instanceToken = "dlEBu1V0yRs:APA91bHT3mQCqZgElbd15_9E24nAydTW0UtWTSLTl-KFg9ZK9P47EvsBheObqlzqiqoaXzKzVzICgI646k2jUJMjeYE3tJkQh97HQUx07qdMZtUiX2vmbeWT_CUhI5OakPGPAYZ_78Qk";
		sendMessage(instanceToken);

		// res.render('index', { title: 'Express' });
		var response = { "response" : "This is a response from the server to a POST request!"};
		res.send(response);
	});
}

function verifyIdToken(userIdToken) {
	// verify the user
	admin.auth().verifyIdToken(userIdToken)
		.then(function(decodedToken) {
		// var uid = decodedToken.uid;
		var uid = decodedToken.uid;
		console.log("uid: " + uid);
		// getUserData(uid);

		// ...
	}).catch(function(error) {
		// Handle error
		console.log("admin.auth(), error verifying userIdToken: " + error);
	});
}

function getUserData(uid) {
	// get the user data
	admin.auth().getUser(uid)
		.then(function(userRecord) {
		// See the UserRecord reference doc for the contents of userRecord.
		console.log("Successfully fetched user data:", userRecord.toJSON());
	}) .catch(function(error) {
		console.log("Error fetching user data:", error);
	});
}

module.exports = router;