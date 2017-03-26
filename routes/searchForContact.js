// start node servernum:
// cd C:\Users\Notandi\Documents\GitHub\hugbunadarverkefni2_server
// npm start

var express = require('express');
var router = express.Router();

var database = require('../databaseAPI.js');

router.post('/', function(req, res, next) {
	var searchString = req.body.searchString;
	console.log("post request on /searchForContact");
	res.setHeader('Content-Type', 'application/json');
	res.send({ response : "searchForContact"});
	// database.searchForContact(searchString).then(function(result) { res.send({ userId : result.userId, username : result.username }); });
});

module.exports = router;