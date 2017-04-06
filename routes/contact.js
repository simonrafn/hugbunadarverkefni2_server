'use strict';

var express = require('express');
var router = express.Router();
var database = require('../databaseAPI.js');
var firebase = require('../util/firebase/firebase.js');

router.post('/block', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');

	database.blockContact(req.body.userId, req.body.subjectId)
		.then(_ => res.send({success: "Contact has been blocked"}))
		.catch(err => {
			console.log("Error blocking contact:", err);
			res.status(500).send({error: "Error blocking contact"});
		});
});

router.post('/unblock', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	
	database.unblockContact(req.body.userId, req.body.subjectId)
		.then(_ => res.send({success: "Contact has been unblocked"}))
		.catch(err => {
			console.log("Error unblocking contact:", err);
			res.status(500).send({error: "Error unblocking contact"});
		});
});

router.post('/delete', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var userId = req.body.userId;
	var subjectId = req.body.subjectId;

	var payload = {
		data : {
			messageType 	: "deleteRequest",
			senderUsername 	: req.user.fullname,
			senderId 		: userId,
			receiverId 		: subjectId
		}
	};

	// delete the connection from both directions and send the person who was deleted that they should remove the deleter from their contact list
	database.deleteContact(userId, subjectId)
		.then(_ => database.deleteContact(subjectId, userId))
		.then(_ => database.getInstanceTokens(subjectId))
		.then(instanceTokens => firebase.sendMessage(instanceTokens, payload))
		.then(_ => res.send({success: "Contact has been deleted"}))
		.catch(err => {
			console.log("Error deleting contact:", err);
			res.status(500).send({error: "Error deleting contact"});
		});
});

router.post('/add', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var userId = req.body.userId;
	var subjectId = req.body.subjectId;
	var payload = {
		// notification : {
		// 	title : "",
		// 	body : req.user.fullname + " wants to be your friend"
		// },
		data : {
			messageType 	: "friendRequest",
			senderUsername 	: req.user.fullname,
			senderId 		: userId,
			receiverId 		: subjectId
		}
	};

	
	// check if the friend request already exists, check if the users are already friends, 
	// get the instance tokens of the receiver and then send the friend request to the right devices and add it to the database
	database.existsFriendRequest(userId, subjectId)
		.then(existsFriendRequest => {
			if(!existsFriendRequest) return database.areFriends(userId, subjectId);
			throw "The friend request already exists";
		})
		.then(areFriends => {
			if(!areFriends) return database.getInstanceTokens(subjectId);
			throw "The users are already friends";
		})
		.then(instanceTokens => firebase.sendMessage(instanceTokens, payload))
		.then(_ => database.addFriendRequest(userId, subjectId))
		.then(_ => res.send({success: "Friend request has been sent"}))
		.catch(err => {
			console.log("Error sending friend request: ", err);
			res.status(500).send({error: "Error sending friend request"});
		});


	// /* User was a friend of subject, but has since deleted subject
	// 	while subject is still a friend of user */
	// database.isOneSidedFriendship(userId, subjectId)
	// 	.then(_ => {
	// 		// check if the friend request already exists, check if the users are already friends, 
	// 		// get the instance tokens of the receiver and then send the friend request to the right devices and add it to the database
	// 		return database.existsFriendRequest(userId, subjectId)
	// 	})
	// 	.then(existsFriendRequest => {
	// 		if(!existsFriendRequest) return database.areFriends(userId, subjectId);
	// 		throw "The friend request already exists";
	// 	})
	// 	.then(areFriends => {
	// 		if(!areFriends) return database.getInstanceTokens(subjectId);
	// 		throw "The users are already friends";
	// 	})
	// 	.then(instanceTokens => firebase.sendMessage(instanceTokens, payload))
	// 	.then(_ => database.addFriendRequest(userId, subjectId))
	// 	.then(_ => res.send({success: "Friend request has been sent"}))
	// 	.catch(err => {
	// 		console.log("Error sending friend request: ", err);
	// 		res.status(500).send({error: "Error sending friend request"});
	// 	});
});

router.post('/acceptFriendRequest', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var userId = req.body.userId;
	var subjectId = req.body.subjectId;
	var payload = {
		// notification : {
		// 	title : "",
		// 	body : req.user.fullname + " has accepted your friend request."
		// },
		data : {
			messageType : "friendResponse",
			senderUsername : req.user.fullname,
			senderId : userId,
			receiverId : subjectId
		}
	};
	// add the sender of the friend request to the receivers contact list in the database, 
	// delete the friend request and send the sender of the friend request a message that it has been accepted
	database.addContact(userId, subjectId)
		.then(_ => database.addContact(subjectId, userId))
		.then(_ => database.deleteFriendRequest(subjectId, userId))
		.then(_ => database.getInstanceTokens(subjectId))
		.then(instanceTokens => firebase.sendMessage(instanceTokens, payload))
		.then(_ => res.send({success: "Friend request has been accepted"}))
		.catch(err => { 
			console.log("Error accepting friend request: ", err); 
			res.status(500).send({error: "Error accepting friend request"}); 
		});
});

router.post('/declineFriendRequest', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	// delete the friend request from the database
	database.deleteFriendRequest(req.body.subjectId, req.body.userId)
		.then(_ => res.send({success: "Friend request has been declined"}))
		.catch(err => { 
			console.log("Error declining friend request: ", err); 
			res.status(500).send({error: "Error declining friend request"}); 
		});
});

module.exports = router;