// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\tempServer
// set DEBUG=tempServer:* & npm start

var express = require('express');
var router = express.Router();


// required to connect to firebase
var admin = require("firebase-admin");
var serviceAccount = require("../cloudmessagingtest2-246fb-firebase-adminsdk-ebnkx-0e73aedfec.json");
// var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cloudmessagingtest2-246fb.firebaseio.com/"
  // databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
});


/* GET home page. */
router.get('/', function(req, res, next) {
	console.log("I got a GET request! :D");

	var idToken = req.body.idToken;
	verifyIdToken(idToken);

	// res.render('index', { title: 'Express' });
	var response = { "response" : "This is a response from the server to a GET request!"};
	res.send(response);
});


router.get('/register', function(req, res, next) {
	console.log("I got a POST request on /register");

	
});

router.post('/', function(req, res, next) {
	console.log("I got a POST request! :D");

	var idToken = req.body.idToken;
	verifyIdToken(idToken);

	var oldInstanceToken = "cly0n1FXyFA:APA91bEApTqE8O4ofiJ7hP_bo2xG3pbPXDuUvB5TAyvAJHDTpiK60NRDkLTTHyMdOTkKt_CrBDGsXcAQq6ueS9gE1Oy5BH_w605dZiwhHHWXi6MKLZo1ItYA3zQsM5pK4euY_QnOvglZ";
	var instanceToken = "dlEBu1V0yRs:APA91bHT3mQCqZgElbd15_9E24nAydTW0UtWTSLTl-KFg9ZK9P47EvsBheObqlzqiqoaXzKzVzICgI646k2jUJMjeYE3tJkQh97HQUx07qdMZtUiX2vmbeWT_CUhI5OakPGPAYZ_78Qk";
	sendMessage(instanceToken /*instanceToken*/);

	// res.render('index', { title: 'Express' });
	var response = { "response" : "This is a response from the server to a POST request!"};
	res.send(response);
});

function sendMessage(registrationToken) {
	// This registration token comes from the client FCM SDKs.
	// var registrationToken = "bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1...";


	// See the "Defining the message payload" section below for details
	// on how to define a message payload.
	var payload = {
		notification: {
			title : "title",
			body : "body"
		},
		data: {
		score: "850",
		time: "2:45"
		}
	};

	// Send a message to the device corresponding to the provided
	// registration token.
	admin.messaging().sendToDevice(registrationToken, payload)
		.then(function(response) {
		// See the MessagingDevicesResponse reference documentation for
		// the contents of response.
		console.log("Successfully sent message:", response);
	}) .catch(function(error) {
		console.log("Error sending message:", error);
	});
}

function verifyIdToken(idToken) {
	// verify the user
	admin.auth().verifyIdToken(idToken)
		.then(function(decodedToken) {
		// var uid = decodedToken.uid;
		var uid = decodedToken.uid;
		console.log("uid: " + uid);
		// getUserData(uid);

		// ...
	}).catch(function(error) {
		// Handle error
		console.log("admin.auth(), error verifying idToken: " + error);
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