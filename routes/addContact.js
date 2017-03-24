// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var admin;

module.exports = function(ad) {
	admin = ad;
	router.post('/', function(req, res, next) {
		console.log("I got a POST request on /register :D");

		var userIdToken = req.body.firebaseUserIdToken;
		var instanceToken = req.body.firebaseInstanceIdToken;

		// call stuff here

		var response = { "response" : "This is a response from the server to a POST request on /register!"};
		res.send(response);
	});

	return router;
}
