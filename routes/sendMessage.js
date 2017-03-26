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
		var content = req.body.content;
		var senderId = req.body.senderId;
		var receiverId = req.body.receiverId;
		var sentDate = req.body.sentDate;

		// verify the user
		admin.auth().verifyIdToken(userIdToken)
			.then(function(decodedToken) {
			// var uid = decodedToken.uid;
			
			var payload = {
				notification : {
					title : "",
					body : content
				},
				data : {
					content : content,
					senderId : senderId,
					receiverId : receiverId,
					sentDate : sentDate
				}
			};

			database.getInstanceTokens(receiverId).then(function(instanceTokens) { sendMessage(instanceTokens, payload); });
			database.insertMessage(content, senderId, receiverId, sentDate);
		}).catch(function(error) {
			// Handle error
			console.log("admin.auth(), error verifying userIdToken: " + error);
		});
	});

	return router;
}
	
function sendMessage(instanceTokens, payload) {
	// Send a message to the devices corresponding to the provided
	// instance tokens.
	admin.messaging().sendToDevice(instanceTokens, payload)
		.then(function(response) {
		// See the MessagingDevicesResponse reference documentation for
		// the contents of response.
		console.log("Successfully sent message:", response);
	}) .catch(function(error) {
		console.log("Error sending message:", error);
	});
}
