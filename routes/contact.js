'use strict';
// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var database = require('../databaseAPI.js');

module.exports = function(admin) {
	router.post('/block', function(req, res, next) {
		var userIdToken = req.body.firebaseUserIdToken;
		res.setHeader('Content-Type', 'application/json');
		// verify the user
		admin.auth().verifyIdToken(userIdToken)
			.then(function(decodedToken) { 
				return database.blockContact(req.body.userId, req.body.subjectId)
					.then(function() { 
						res.send({ response: "success" }); 
					}); 
			})
			.catch(function(error) { 
				console.log("admin.auth(), error verifying userIdToken" + error); 
				res.status(500); 
			});
	});
	router.post('/unblock', function(req, res, next) {
		var userIdToken = req.body.firebaseUserIdToken;
		res.setHeader('Content-Type', 'application/json');
		// verify the user
		admin.auth().verifyIdToken(userIdToken)
			.then(function(decodedToken) { 
				return database.unblockContact(req.body.userId, req.body.subjectId)
					.then(function() { 
						res.send({ response: "success" });
					}); 
			})
			.catch(function(error) { 
				console.log("admin.auth(), error verifying userIdToken" + error); 
				res.status(500); 
			});
	});
	router.post('/delete', function(req, res, next) {
		var userIdToken = req.body.firebaseUserIdToken;
		res.setHeader('Content-Type', 'application/json');
		// verify the user
		admin.auth().verifyIdToken(userIdToken)
			.then(function(decodedToken) { 
				return database.deleteContact(req.body.userId, req.body.subjectId)
					.then(function() { 
						res.send({ response: "success" });
					}); 
			})
			.catch(function(error) { 
				console.log("admin.auth(), error verifying userIdToken" + error); 
				res.status(500); 
			});
	});
	router.post('/add', function(req, res, next) {
		res.setHeader('Content-Type', 'application/json');
		var userIdToken = req.body.firebaseUserIdToken;
		var userId = req.body.userId;
		var subjectId = req.body.subjectId;
		var payload = {
			notification : {
				title : "",
				body : ""
			},
			data : {
				messageType : "friendRequest",
				senderUsername : "",
				senderId : senderId,
				receiverId : receiverId
			}
		};

		// verify the user, get the username, check if the friend request already exists, check if the users are already friends, 
		// get the instance tokens of the receiver and then send the friend request to the right devices and add it to the database
		admin.auth().verifyIdToken(userIdToken)
			.then(decodedToken => admin.auth().getUser(decodedToken.uid))
			.then(userRecord => {
				payload.notification.body = userRecord.displayName + " wants to be your friend";
				payload.data.senderUsername = userRecord.displayName;
			})
			.then(_ => database.existsFriendRequest(userId, subjectId))
			.then(existsFriendRequest => {
				if(!existsFriendRequest) return database.areFriends(userId, subjectId);
				return true;
			})
			.then(areFriends => {
				if(!areFriends) return database.getInstanceTokens(subjectId);
			})
			.then(instanceTokens => sendMessage(instanceTokens, payload))
			.then(_ => database.addFriendRequest(userId, subjectId))
			.catch(err => {
				console.log("Error sending friend request: " + err);
				res.status(500);
			});

	});
	router.post('/acceptFriendRequest', function(req, res, next) {
		res.setHeader('Content-Type', 'application/json');
		var userIdToken = req.body.firebaseUserIdToken;
		var userId = req.body.userId;
		var subjectId = req.body.subjectId;
		var payload = {
			notification : {
				title : "",
				body : ""
			},
			data : {
				messageType : "friendResponse",
				accepterUsername : "",
				senderId : senderId,
				receiverId : receiverId
			}
		};
		// verify the user, add the sender of the friend request to the receivers contact list in the database, 
		// delete the friend request and send the sender of the friend request a message that it has been accepted
		admin.auth().verifyIdToken(userIdToken)
			.then(decodedToken => admin.auth().getUser(decodedToken.uid))
			.then(userRecord => {
				payload.notification.body = userRecord.displayName + " has accepted your friend request.";
				payload.data.accepterUsername = userRecord.displayName;
			})
			.then(_ => database.addContact(userId, subjectId))
			.then(_ => database.addContact(subjectId, userId))
			.then(_ => database.deleteFriendRequest(subjectId, userId))
			.then(_ => database.getInstanceTokens(subjectId))
			.then(instanceTokens => sendMessage(instanceTokens, payload))
			.catch(err => { 
				console.log("Error accepting friend request: " + err); 
				res.status(500); 
			});
	});
	router.post('/declineFriendRequest', function(req, res, next) {
		res.setHeader('Content-Type', 'application/json');
		var userIdToken = req.body.firebaseUserIdToken;
		var userId = req.body.userId;
		var subjectId = req.body.subjectId;
		// verify the user, delete the friend request from the database
		admin.auth().verifyIdToken(userIdToken)
			.then(decodedToken => database.deleteFriendRequest(subjectId, userId))
			.catch(err => { 
				console.log("Error rejecting friend request: " + err); 
				res.status(500); 
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