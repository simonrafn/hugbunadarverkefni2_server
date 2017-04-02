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
	var sentDate = req.body.sentDate;

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
			sentDate : sentDate
		}
	};

	database.getInstanceTokens(receiverId)
		.then(function(instanceTokens) { 
			firebase.sendMessage(instanceTokens, payload); 
		});
	database.insertMessage(content, senderId, receiverId, sentDate);
});

module.exports = router;