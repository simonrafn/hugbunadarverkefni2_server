'use strict';
// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var database = require('../databaseAPI.js');

var firebase = require('../util/firebase/firebase.js')

router.post('/', function(req, res, next) {
	var content = req.body.content;
	var senderId = req.body.senderId;
	var receiverId = req.body.receiverId;
	var sentTime = req.body.sentTime;

	var payload = {
		notification : {
			title : "",
			body : content
		},
		data : {
			messageType : "chatMessage",
			content : content,
			senderId : senderId,
			receiverId : receiverId,
			sentTime : sentTime
		}
	};

	database.areFriends(senderId, receiverId)
		.then(areFriends => {
			if(areFriends) return database.hasBlocked(receiverId, senderId);
			throw "The users are not friends";
		})
		.then(hasBlocked => {
			if(!hasBlocked) return database.getInstanceTokens(receiverId);
			throw "The receiver has blocked the sender";
		})
		.then(instanceTokens => firebase.sendMessage(instanceTokens, payload))
		.then(addToDatabase => database.insertMessage(content, senderId, receiverId, sentTime))
		.then(_ => res.send({success: "Message has been sent"}))
		.catch(err => {
			console.log("Error sending message:", err);
			res.status(500).send({error: "Error sending message"})
		});
});

module.exports = router;