'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var firebase = require('./util/firebase/firebase.js');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// routes
var register = require('./routes/register');
app.use('/register', firebase.requireAuth, firebase.requireUserDetails, register);

var sendMessage = require('./routes/sendMessage');
app.use('/sendMessage', firebase.requireAuth, sendMessage);

var contact = require('./routes/contact');
app.use('/contact', contact);

var searchForContact = require('./routes/searchForContact');
app.use('/searchForContact', searchForContact);

/*

// routes
var register = require('./routes/register')(admin);
app.use('/register', firebase.requireAuth, firebase.requireUserDetails, register);

var sendMessage = require('./routes/sendMessage')(admin);
app.use('/sendMessage', sendMessage);

var contact = require('./routes/contact')(admin);
app.use('/contact', contact);

var searchForContact = require('./routes/searchForContact');
app.use('/searchForContact', searchForContact);

*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
