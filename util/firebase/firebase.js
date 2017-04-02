'use strict';

var admin = require("firebase-admin");
var serviceAccount = require("./cloudmessagingtest2-246fb-firebase-adminsdk-ebnkx-0e73aedfec.json");
// var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://cloudmessagingtest2-246fb.firebaseio.com/"
  // databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
});

function requireAuth (req, res, next) {
	if(!req.user) req.user = {};
	req.user.userIdToken = req.body.firebaseUserIdToken;
	req.user.instanceToken = req.body.firebaseInstanceIdToken;
	admin.auth().verifyIdToken(req.user.userIdToken)
	.then(decodedToken => {
		console.log("Authenticated user");
		console.log("User uid:", decodedToken.uid);
		req.user.uid = decodedToken.uid; // uid is unique and persistent, it can be used to identify the user
		next();
	})
	.catch(e => {
		console.log("Error authenticating user:", e);
		res.status(401).send({error: "Permission required"});
	});
}

function requireUserDetails (req, res, next) {
	admin.auth().getUser(req.user.uid)
	.then(userRecord => {
		console.log("Fetched user info");
		console.log("User fullname:", userRecord.displayName);
		console.log("User email:", userRecord.email);
		req.user.fullname = userRecord.displayName;
		req.user.email = userRecord.email;
		next();
	})
	.catch(e => {
		console.log("Error getting user data:", e);
		res.status(404).send({error: "Resource not found"});
	});
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
		console.log("Error sending message of type: " + payload.data.messageType);
		console.log("Error:", error);
	});
}

module.exports = {
	requireAuth : requireAuth,
	requireUserDetails : requireUserDetails,
	sendMessage : sendMessage
};