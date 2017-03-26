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
	router.post('/add', function(req, res, next) {
		var userIdToken = req.body.firebaseUserIdToken;
		res.setHeader('Content-Type', 'application/json');
		// verify the user
		admin.auth().verifyIdToken(userIdToken)
			.then(function(decodedToken) { 
				return database.addContact(req.body.userId, req.body.subjectId)
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

	return router;
}