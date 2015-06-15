// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model

var TwoDArray = new mongoose.Schema({
    values  : Array
});
var UserSchema = new mongoose.Schema({

    local            : {
        email        : String,
        password     : String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        gender       : String,
        birthday     : String,
        location     : String
    },

    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },

    interests        : [String]
});

// define the schema for site model
var SiteSchema = new mongoose.Schema({
    fields    : {
        ville: String,
        nom_du_musee : String,
        siteweb : String,
        adresse : String,
        dept    : Number,
        ferme   : String,
        cp      : Number,
        departements: String,
        wgs84   : Array,
        periode_ouverture: String,
        fermeture_annuelle: String 
    },

    geometry : {
        type   : String,
        coordinates : Array
    },
    visit   :   Number
});

// define the schema for Trip model
var TripSchema = new mongoose.Schema({
    name : String,
    user: {type :mongoose.Schema.ObjectId, ref: 'UserSchema'},
    start_date : String,
    end_date : String,
    start_time: String,
    end_time : String,
    sites: [{type :mongoose.Schema.ObjectId, ref: 'SiteSchema'},],
    stayaddress   : {name: String, coordinates :Array},
    feedback  : String,
    updated_at : Date,
    planning : {
        combi : String,
        sites : String
    }
});


//Define a rating schema
var RatingSchema = new mongoose.Schema({
    user : {type :mongoose.Schema.ObjectId, ref: 'UserSchema'},
    site : {type :mongoose.Schema.ObjectId, ref: 'SiteSchema'},
    value : {type : Number , min:0 , max:10} 
});


// methods ======================
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};


// create the model for sites, elements of a trip and expose it to our app
User = mongoose.model('User', UserSchema);
Site = mongoose.model('Site', SiteSchema);
Trip = mongoose.model('Trip', TripSchema);

// Exports created models
module.exports ={"User" : User, "Site" : Site , "Trip" : Trip};
