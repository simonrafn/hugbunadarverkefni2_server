'use strict';
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
				res.setHeader('Content-Type', 'application/json');
				// get the userId from the database and send the result to the client app
				database.insertOrUpdateUser(uid, instanceToken, username, email).then(function(userId) { res.send({ userId : userId }); });
			}).catch(function(error) {
				console.log("Error fetching user data: ", error);
			});
		}).catch(function(error) {
			// Handle error
			console.log("Error registering user ", error);
		});
	});

	return router;
}