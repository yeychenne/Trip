// app/models/trip.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for site model
var siteSchema = mongoose.Schema({
    address : String,
    openning_hours : String,
    location : String,
    average_rating: int,
    category : String

});

var tripSchema = mongoose.Schema({
    user_id : String,
    start_date : Date,
    end_date : Date,
    Sites: Array,
});



// create the model for sites, elements of a trip and expose it to our app
Site = mongoose.model('Site', siteSchema);
Trip = mongoose.model('Trip', tripSchema);

module.exports ={"Site" : Site , "Trip" : Trip};