'use strict';
// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var database = require('../databaseAPI.js');

router.post('/', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	database.searchForContact(req.body.searchString)
		.then(result => { 
			if(result) res.send({ userId : result.id, username : result.username }); 
			else res.status(404).send({success: "User not found"}); 
		})
		.catch(err => { 
			console.log("Error searching for contact: ", error); 
			res.status(500).send({error: "Error searching for contact"}); 
		});
});

module.exports = router;