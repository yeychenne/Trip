/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express')
  , app = express()
  , bluemix = require('./config/bluemix')
  , watson = require('watson-developer-cloud')
  , extend = require('util')._extend
  , stylus = require('stylus')
  , nib = require('nib')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , flash    = require('connect-flash')
  , errorhandler = require('errorhandler')
  , cookieParser = require('cookie-parser')
  , morgan       = require('morgan')
  , session      = require('express-session')
  , bodyParser   = require('body-parser')
  , favicon = require('serve-favicon');

//Config mongoDB ======================================================================
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);


// Configure Express ==================================================================
  app.use(bodyParser());
  app.use(cookieParser());
  app.use(morgan('dev'));

//Compile functions for Stylus
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
 }

  // Setup static public directory
  app.use(express.static(__dirname + '/public'));

  //Set up Jade as view engine
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');
  app.use(stylus.middleware({ src: __dirname + '/public', compile: compile}));

  // Add error handling in dev
 
  app.use(errorhandler());

//Passport settings ====================================================================
require('./config/passport')(passport); // pass passport for configuration
app.use(session({ secret: 'ibminnoproject2016'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(favicon(__dirname + '/public/img/favicon.ico'));


// routes ======================================================================
// User relative --------------------------------------------------------------
require('./app/user_routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// Trip relative --------------------------------------------------------------
require('./app/trip_routes.js')(app);
require('./app/optimize.js')(app);

// catch 404 and forward to error handler
app.get('/404', function(req, res, next){
  // trigger a 404 since no other middleware
  // will match /404 after this one, and we're not
  // responding here
  next();
});

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});



// Port ========================================================================
var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);