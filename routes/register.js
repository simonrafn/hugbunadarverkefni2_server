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
		var userIdToken = req.body.firebaseUserIdToken;
		var instanceToken = req.body.firebaseInstanceIdToken;

		registerUser(userIdToken, instanceToken, res);

		// TODO: the response should be moved to the registerUser function and the response should include the userId
		// var response = { "response" : "This is a response from the server to a POST request on /register!"};
		// res.send(response);
	});

	return router;
}

function registerUser(userIdToken, instanceToken, res) {
	// verify the user
	admin.auth().verifyIdToken(userIdToken)
		.then(function(decodedToken) {
		var uid = decodedToken.uid; // uid is unique and persistent, it can be used to identify the user

		// get the user data
		admin.auth().getUser(uid)
			.then(function(userRecord) {
			// console.log("Successfully fetched user data:", userRecord.toJSON());
			var username = userRecord.displayName;
			var email = userRecord.email;

			// get the userId from the database and send the result to the client
			res.setHeader('Content-Type', 'application/json');
			// should be: database.registerOrRefreshUser(uid, instanceToken, username, email).then(function(userId) { res.send({ userId : userId }); });		
			database.registerOrRefreshUser(uid, instanceToken, "username", "email"); // temporary
			res.send({ userId : "tempUserId" }); // temporary

		}) .catch(function(error) {
			console.log("Error fetching user data:", error);
		});
	}).catch(function(error) {
		// Handle error
		console.log("admin.auth(), error verifying userIdToken: " + error);
	});
}