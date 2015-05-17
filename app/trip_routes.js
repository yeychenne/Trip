// File system module
var fs = require('fs');
// load up the trip model
var Trip   = require('../app/models').Trip;
var Site   = require('../app/models').Site;

module.exports = function(app) {

// New trip ============================================
    app.get('/newtrip', function(req, res) {
        Site.find({}).lean().exec(function (err, sites) {
            if(err) console.log("Cannot read database");
            res.render('newtrip', {sites: sites});
        });
    });

    app.get('/newtrip/:id', function (req, res) {
        var id = req.params.id;
        while(id.charAt(0) === ':')
            id = id.substr(1);
        console.log(id);
        Trip.findById(id, function(err, trip){
            if (err) { 
                console.log("Problem!!!!!");
                res.send(err);
            } else if (trip) {
            console.log(trip);
            res.render('newtrip', {trip: trip});
        } else {
        res.send("Something went wrong");
        }
        });
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
        console.log(req.body.start_date);
        var newtrip = new Trip({
            name : req.body.name,
            user: req.user,
            start_date : req.body.start_date,
            end_date : req.body.end_date,
            sites: [],
            feedback  : "",
            updated_at : Date.now(),
        });
        newtrip.save(function (err) {
            if (err) return handleError(err);
            res.redirect( '/newtrip/:'+newtrip.id );
        });
    });


}