'use strict';
// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var database = require('../databaseAPI.js');

router.post('/', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var uid = req.user.uid;
	var instanceToken = req.user.instanceToken;
	var username = req.user.fullname;
	var email = req.user.email;

	uid = Math.floor(1000000*Math.random());
	username = "Bill"+uid;

	// get the userId from the database and send the result to the client app
	database.insertOrUpdateUser(uid, instanceToken, username, email)
		.then(function(userId) { 
			res.send({ userId : userId }); 
		})
		.catch(err => {
			console.log("Error registering user: ", err);
			res.status(500);
		});
});

module.exports = router;