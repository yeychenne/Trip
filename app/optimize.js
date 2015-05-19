// File system module
var gm = require('googlemaps');
// load up the trip model
var Trip   = require('./models').Trip;
var Site   = require('./models').Site;
var configAuth = require('../config/auth'); // use this one for testing
//require('./utils.js');
//require('./gatsp.js');
module.exports = function(app) {

// Trip Optimize =============================================
    app.get('/optimize/:id', function (req, res) {
        var id = req.params.id;
        var pts="";
        var nodes=["s"];
        while(id.charAt(0) === ':')
            id = id.substr(1);
        Trip.findById(id, function(err, trip){
            if (err) {
                console.log("Wrong trip id");
            } else {
                if (trip) {
                pts+=trip.stayaddress.coordinates[0]+','+trip.stayaddress.coordinates[1]+'|';
                Site.find({'_id': { $in:trip.sites}}).lean().exec(function(err, sites){
                    for (var i=0; i<sites.length;i++){
                        pts+=sites[i].geometry.coordinates[1]+","+sites[i].geometry.coordinates[0]+"|";
                        nodes.push(sites[i]._id);
                        }
                    var nodes_size=nodes.length;
                    pts=pts.substring(0, pts.length - 1);
                    console.log(nodes_size);
                    console.log(pts);
                    gm.distance(pts, pts, callback, false, "driving");
                    function callback(status, response) {
                        console.log(nodes_size);
                        console.log(response.rows[i].elements[j].duration.value);
                        var dis = new Array(nodes_size);
                        for(var i=0; i<nodes_size; i++){
                            dis[i] = new Array(nodes_size);
                            for (var j=0; j<nodes_size;j++){
                                dis[i][j]=response.rows[i].elements[j].duration.value;}
                        }
                        console.log(dis);
                        //initData();
                        //GAInitialize();
                        console.log(bestValue);
                        res.render('optimize', {sites: sites, trip: trip});
                    }});
                } else
                    console.log("Something went wrong");
            }});
    });
}