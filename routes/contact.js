// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var database = require('../databaseAPI.js');

var admin;

module.exports = function(ad) {
	admin = ad;
	router.post('/block', function(req, res, next) {
		// databaseAction(req, database.blockContact);
		console.log("post request on /block");
		res.setHeader('Content-Type', 'application/json');
		res.send({ response : "block"});
	});
	router.post('/unblock', function(req, res, next) {
		// databaseAction(req, database.unblockContact);
		console.log("post request on /unblock");
		res.setHeader('Content-Type', 'application/json');
		res.send({ response : "unblock"});
	});
	router.post('/add', function(req, res, next) {
		// databaseAction(req, database.addContact);
		console.log("post request on /add");
		res.setHeader('Content-Type', 'application/json');
		res.send({ response : "add"});
	});
	router.post('/delete', function(req, res, next) {
		// databaseAction(req, database.deleteContact);
		console.log("post request on /delete");
		res.setHeader('Content-Type', 'application/json');
		res.send({ response : "delete"});
	});

	return router;
}

function databaseAction(req, dbfunction) {
	// verify the user
	admin.auth().verifyIdToken(userIdToken)
		.then(function(decodedToken) {
		// var uid = decodedToken.uid;
		
		dbfunction(req.userId, req.subjectId);
	}).catch(function(error) {
		// Handle error
		console.log("admin.auth(), error verifying userIdToken: " + error);
	});
}

