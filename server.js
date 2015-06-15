//App config

var express = require('express')
  , cfenv = require('cfenv')
  , app = express()
  , extend = require('util')._extend
  , http = require('http')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , flash    = require('connect-flash')
  , errorhandler = require('errorhandler')
  , cookieParser = require('cookie-parser')
  , morgan       = require('morgan')
  , session      = require('express-session')
  , bodyParser   = require('body-parser')
  , favicon = require('serve-favicon');


//Config ENV  ======================================================================
var appEnv = cfenv.getAppEnv();
//Config mongoDB ======================================================================
var configDB = require('./config/database.js');
if(appEnv.isLocal)
mongoose.connect(configDB.local);
else
mongoose.connect(configDB.bluemix);

// Configure Express ==================================================================
  app.use(bodyParser());
  app.use(cookieParser());
  app.use(morgan('dev'));

// Setup static public directory
app.use(express.static(__dirname + '/public'));

//Set up Jade as view engine
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

// Add error handling in dev

app.use(errorhandler());

//Passport settings ====================================================================
if(appEnv.isLocal)
require('./config/passportLoc')(passport); // pass passport for configuration
else
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
require('./app/optimize.js')(app,appEnv);

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
// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {
  console.log("server starting on " + appEnv.url);
});