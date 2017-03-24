// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var database = require('../databaseAPI.js');

var admin;

module.exports = function(ad) {
	admin = ad;
	router.post('/', function(req, res, next) {
		console.log("I got a POST request on /register :D");

		var userIdToken = req.body.firebaseUserIdToken;
		var instanceToken = req.body.firebaseInstanceIdToken;

		registerUser(userIdToken, instanceToken);

		// TODO: the response should be moved to the registerUser function and the response should include the userId
		var response = { "response" : "This is a response from the server to a POST request on /register!"};
		res.send(response);
	});

	return router;
}

function registerUser(userIdToken, instanceToken) {
	// verify the user
	admin.auth().verifyIdToken(userIdToken)
		.then(function(decodedToken) {
		// var uid = decodedToken.uid;
		var uid = decodedToken.uid; // uid is unique and persistent, it can be used to identify the user
		console.log("uid: " + uid);
		// getUserData(uid);

		// TODO: update the database with the possibly new instanceToken, you can use the uid to identify the user and create a new user if she didn't already exist
		// send the userId (should be in the response from the database) back to the client
		database.registerUser(uid, instanceToken); // temporary

		// ...
	}).catch(function(error) {
		// Handle error
		console.log("admin.auth(), error verifying userIdToken: " + error);
	});
}