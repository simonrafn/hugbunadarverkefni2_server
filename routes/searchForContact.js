'use strict';
// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var database = require('../databaseAPI.js');

router.post('/', function(req, res, next) {
	var searchString = req.body.searchString;
	res.setHeader('Content-Type', 'application/json');
	// res.send({ response : "searchForContact"});
	database.searchForContact(searchString)
		.then(function(result) { console.log("userId: ", result.id); console.log("username: ", result.username); res.send({ userId : result.id, username : result.username }); })
		.catch( function(error) { res.status(500); } );
});

module.exports = router;