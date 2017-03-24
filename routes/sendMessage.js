// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var admin;

module.exports = function(ad) {
	admin = ad;
	router.post('/', function(req, res, next) {
		console.log("I got a POST request on /register :D");

		var userIdToken = req.body.firebaseUserIdToken;
		var instanceToken = req.body.firebaseInstanceIdToken;

		sendMessage();

		var response = { "response" : "This is a response from the server to a POST request on /register!"};
		res.send(response);
	});

	return router;
}

function sendMessage(instanceToken, payload) {
	// This instance token comes from the client FCM SDKs.
	// var instanceToken = "bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1...";


	// See the "Defining the message payload" section below for details
	// on how to define a message payload.
	/*var payload = {
		notification: {
			title : "title",
			body : "body"
		},
		data: {
		score: "850",
		time: "2:45"
		}
	};*/

	// Send a message to the device corresponding to the provided
	// registration token.
	admin.messaging().sendToDevice(instanceToken, payload)
		.then(function(response) {
		// See the MessagingDevicesResponse reference documentation for
		// the contents of response.
		console.log("Successfully sent message:", response);
	}) .catch(function(error) {
		console.log("Error sending message:", error);
	});
}
