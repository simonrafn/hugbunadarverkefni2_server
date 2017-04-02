'use strict';
// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var database = require('../databaseAPI.js');

router.post('/', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	
	// uid = Math.floor(1000000*Math.random());
	// instanceToken = Math.floor(1000000*Math.random());
	// username = "Bill"+uid;

	// get the userId from the database and send the result to the client app
	database.insertOrUpdateUser(
			req.user.uid, 
			req.user.instanceToken, 
			req.user.fullname, 
			req.user.email)
		.then(function(userId) { 
			res.send({ success: "You have been registered", userId: userId }); 
		})
		.catch(err => {
			console.log("Error registering user: ", err);
			res.status(500).send({error: "Error registering user"});
		});
});

module.exports = router;