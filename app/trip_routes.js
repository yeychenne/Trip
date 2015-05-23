// File system module
var fs = require('fs');
// load up the trip model
var Trip   = require('./models').Trip;
var Site   = require('./models').Site;
var configAuth = require('../config/auth');

module.exports = function(app) {

// New trip ============================================
    app.get('/editsites/:id', function (req, res) {
        var id = req.params.id;
        while(id.charAt(0) === ':')
            id = id.substr(1);
        Trip.findById(id, function(err, trip){
            if (err) {
                console.log("Wrong trip id");
                res.send(err);
            } else {
                if (trip) {
                console.log(trip);
                Site.find({}).lean().exec(function (err, dbsites) {
                    if(err) console.log("Cannot read sites database");
                    res.render('editsites', {dbsites: dbsites, trip: trip});
                });
                } else
                res.send("Something went wrong");
        }});
        });
// Trip Recap =============================================
    app.get('/recap/:id', function (req, res) {
        var id = req.params.id;
        while(id.charAt(0) === ':')
            id = id.substr(1);
        Trip.findById(id, function(err, trip){
            if (err) {
                console.log("Wrong trip id");
                res.send(err);
            } else {
                if (trip) {
                console.log(trip);
                Site.find({'_id': { $in:trip.sites}}).lean().exec(function(err, sites){
                    console.log(sites);
                    res.render('recap', {sites: sites, trip: trip});
                });
                } else
                console.log("Something went wrong");
        }});
    });

// API Export the sites database ==============================
    app.get("/api/sites", function (req, res) {
    Site.find({}).lean().exec(function (err, sites) {
        var Sites = JSON.stringify(sites);
        res.json(Sites);
        console.log(Sites);
      });
    });


// process the new trip form ===========================
    app.post('/newtrip',function(req, res) {
        console.log(JSON.stringify(req.body));
        var coordinates=new Array();
        coordinates.push(req.body.lat);
        coordinates.push(req.body.lng);
        var newtrip = new Trip({
            name : req.body.name,
            user: req.user,
            start_date : req.body.start_date,
            end_date : req.body.end_date,
            sites: [],
            feedback  : "",
            updated_at : Date.now(),
            stayaddress    : { "name" :req.body.textaddress, "coordinates":coordinates }
        });
        newtrip.save(function (err) {
            if (err) return handleError(err);
            res.redirect( '/editsites/:'+newtrip.id );
        });
    });

// Process selected sites ==============================
    app.post("/savesites",function(req, res) {
        var tripId=req.body.meta;
        var selected=JSON.parse(req.body.tosend);
        Trip.update({_id:tripId}, {$set: { sites: selected, updated_at : Date.now()}}, {upsert: true}, function(err){if (err) console.log("Wrong!")});
        res.redirect( '/recap/:'+tripId );
    });
}