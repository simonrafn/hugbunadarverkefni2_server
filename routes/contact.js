'use strict';

var express = require('express');
var router = express.Router();
var database = require('../databaseAPI.js');
var firebase = require('../util/firebase/firebase.js');

router.post('/block', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');

	database.blockContact(req.body.userId, req.body.subjectId)
		.then(_ => res.status(200).send({success: "Contact has been blocked"}))
		.catch(err => {
			console.log("Error blocking contact:", err);
			res.status(500).send({error: "Error blocking contact"});
		});
});

router.post('/unblock', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	
	database.unblockContact(req.body.userId, req.body.subjectId)
		.then(_ => res.status(200).send({success: "Contact has been unblocked"}))
		.catch(err => {
			console.log("Error unblocking contact:", err);
			res.status(500).send({error: "Error unblocking contact"});
		});
});

router.post('/delete', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	
	database.deleteContact(req.body.userId, req.body.subjectId)
		.then(_ => res.status(200).send({success: "Contact has been deleted"}))
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
		notification : {
			title : "",
			body : req.user.fullname + " wants to be your friend"
		},
		data : {
			messageType : "friendRequest",
			senderUsername : req.user.fullname,
			senderId : userId,
			receiverId : subjectId
		}
	};

	// check if the friend request already exists, check if the users are already friends, 
	// get the instance tokens of the receiver and then send the friend request to the right devices and add it to the database
	database.existsFriendRequest(userId, subjectId)
		.then(existsFriendRequest => {
			if(!existsFriendRequest) return database.areFriends(userId, subjectId);
			return true;
		})
		.then(areFriends => {
			if(!areFriends) return database.getInstanceTokens(subjectId);
		})
		.then(instanceTokens => {
			if(instanceTokens && instanceTokens.length != 0) return firebase.sendMessage(instanceTokens, payload);
			return false;
		})
		.then(addToDatabase => {
			if(addToDatabase) database.addFriendRequest(userId, subjectId);
		})
		.then(_ => res.status(200).send({success: "Friend request has been sent"}))
		.catch(err => {
			console.log("Error sending friend request: ", err);
			res.status(500).send({error: "Error sending friend request"});
		});
});

router.post('/acceptFriendRequest', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var userId = req.body.userId;
	var subjectId = req.body.subjectId;
	var payload = {
		notification : {
			title : "",
			body : req.user.fullname + " has accepted your friend request."
		},
		data : {
			messageType : "friendResponse",
			accepterUsername : req.user.fullname,
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
		.then(_ => res.status(200).send({success: "Friend request has been accepted"}))
		.catch(err => { 
			console.log("Error accepting friend request: ", err); 
			res.status(500).send({error: "Error accepting friend request"}); 
		});
});

router.post('/declineFriendRequest', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var userId = req.body.userId;
	var subjectId = req.body.subjectId;
	// delete the friend request from the database
	database.deleteFriendRequest(subjectId, userId)
		.then(_ => res.status(200).send({success: "Friend request has been declined"}))
		.catch(err => { 
			console.log("Error declining friend request: ", err); 
			res.status(500).send({error: "Error declining friend request"}); 
		});
});

module.exports = router;