var gm = require('google-distance-matrix');
var http = require("http");
var https = require("https");
// load up the trip model
var Trip   = require('./models').Trip;
var Site   = require('./models').Site;
var configAuth = require('../config/auth');
gm.key(configAuth.googleAuth.APIkey);
module.exports = function(app, appEnv) {
// Trip Optimization Data =============================================
    app.get('/optimize/data/:id', function (req, res) {
        var id = req.params.id;
        var origins=[];
        var nodes=["s"];
        var visits=[];
        var dis;
        while(id.charAt(0) === ':')
            id = id.substr(1);
        Trip.findById(id, function(err, trip){
            if (err) {
                console.log("Wrong trip id");
            } else {
                if (trip) {
                origins.push(trip.stayaddress.coordinates[0]+','+trip.stayaddress.coordinates[1]);
                visits.push(0);
                var days=(Date.parse(trip.end_date)-Date.parse(trip.start_date))/86400000+1;
                Site.find({'_id': { $in:trip.sites}}).lean().exec(function(err, sites){
                    for (var i=0; i<sites.length;i++){
                        origins.push(sites[i].geometry.coordinates[1]+","+sites[i].geometry.coordinates[0]);
                        nodes.push(sites[i]._id);
                        visits.push(Math.round(sites[i].visit*60));
                        }
                    var nodes_size=origins.length;
                    gm.matrix(origins, origins, function (err, distances) {
                        if (!err){
                            console.log(distances);
                            dis=new Array(nodes_size);
                            for (var i=0;i<nodes_size;i++){
                                dis[i]=new Array(nodes_size);
                                for (var j=0;j<nodes_size;j++)
                                    dis[i][j]=distances.rows[i].elements[j].duration.value+visits[i];
                            }
                            console.log("Sent: "+{days: days,visits:visits, matrix:dis, trip:trip,sites:sites, nodes:nodes});
                            res.json({days: days,visits:visits, matrix:dis, trip:trip,sites:sites, nodes:nodes});
                    }
                    else console.log("Cannot get Distance Matrix "+distances.status);});
                    });
            } else
                    console.log("Something went wrong");
            }});
    });



// Trip Optimization =============================================
    app.get('/optimize/:id', function (req, res) {
        var id = req.params.id;
        while(id.charAt(0) === ':')
            id = id.substr(1);
        var options = {
        hostname: '127.0.0.1'
        ,port: appEnv.port
        ,path: '/optimize/data/:'+id
        ,headers: { 'Content-Type': 'application/json' }
        };
        var req = http.get(options, function(response) {
          response.on('data', function (optData) {
               var data=JSON.parse(optData);
               var D=data.matrix;
               var n=data.sites.length;
               var days=data.days;
               var delta=28800; //8 hours per day
               var mybest=roulette(n,delta,D,days,100);
               console.log("Sent data:")
               console.log(JSON.stringify(mybest));
               console.log(JSON.stringify(data));
               res.render('optimize',{combi: mybest, data:data});
          });
        });
    });






    app.get('/test', function (req, res) {
        var n=8;
        var delta=50;
        var days=3;
        var D=[   [ 0, 5, 3, 4, 5, 6, 8, 11, 1 ],
                  [ 2, 0, 5, 7, 5, 3, 8, 2, 14 ],
                  [ 7, 5, 0, 4, 5, 16, 8, 1, 20 ],
                  [ 5, 5, 3, 0, 15, 22, 8, 14, 21 ],
                  [ 5, 5, 3, 4, 0, 6, 8, 11, 1 ],
                  [ 8, 5, 3, 4, 5, 0, 8, 1, 11 ],
                  [ 6, 5, 3, 4, 5, 6, 0, 4, 7 ],
                  [ 9, 5, 3, 4, 5, 6, 8, 0, 21 ],
                  [ 3, 5, 3, 4, 5, 6, 8, 17, 0 ] ];
        var ex=combi(n,delta,D,days);
        var c1=costcmb(ex,D);
        console.log("combi 1 :"+ex);
        console.log("Cost 1 ="+c1);
        var exp=combi(n,delta-2,D,days);
        var c2=costcmb(exp,D);
        console.log("combi 2 :"+exp);
        console.log("Cost 2 ="+c2);
        console.log("here's a roulete test:")
        var mybest=roulette(n,delta,D,days,100)
        console.log("Top = " +mybest.bestcomb+" of cost:"+ mybest.bestcost);
        res.send("running");
    });

function combi(n,delta,D,days){
    //n is the number of nodes to visit (start=end point not included)
    //D distance matrix
    //delta is the day duration
    //days is the number of days in the trip
    var tovisit = [];
    for (var i = 1; i <= n; i++) {
        tovisit.push(i);
    }
    var prop=new Array(days);
    for(var i=0;i<days;i++){
        prop[i]=new Array();
        prop[i].push(0); //0 for home node
    }
    for(var i=0;i<days;i++){ //Looping over days
        var time=0;
    for (var j=1;j<=n;j++){
        var iters=0;
        var temp;
        do {
            temp=Math.floor(Math.random()*(tovisit.length-1));
            iters++;}
            while(time+D[prop[i][j-1]][tovisit[temp]]+D[tovisit[temp]][0]>delta && iters<100000)
        if(time+D[prop[i][j-1]][tovisit[temp]]+D[tovisit[temp]][0]>delta) break;
        prop[i].push(tovisit[temp]);
        tovisit.splice(temp,1);
        time+=D[prop[i][j-1]][prop[i][j]];
        if(tovisit.length==0) break;
    }
    if(tovisit.length==0) break;
    }
    for(var i=0;i<days;i++){
        prop[i].push(0);
    }
    return {prop:prop, unvisited:tovisit};
    }
function costcmb(combix,D){
    // To compare two routes we'll choose the ones with less commuting. we're also favorising well distributed routes.
    var days=combix.prop.length;
    var duration=new Array(days);
    var sum=0;
    var sq=0;
    if (combix.prop==0) return Number.POSITIVE_INFINITY;
    for(var i=0;i<days;i++){
        duration[i]=0;
        for(var j=0; j<combix.prop[i].length-1;j++){
            duration[i]+=D[combix.prop[i][j]][combix.prop[i][j+1]];
        }
        sum+=duration[i];
        sq+=duration[i]*duration[i];
    }
    var average=sum/days;
    var variance=sq/days-average*average;
    return {cost:variance+average*average, time:duration};
}

function roulette(n,delta,D,days,maxiters){
    var bestcomb=combi(n,delta,D,days); //init
    var bestcost=costcmb(bestcomb,D);
    for(var i=0;i<maxiters;i++){
        var altcomb=combi(n,delta,D,days);
        var altcost=costcmb(altcomb,D);
        if(altcost.cost<bestcost.cost){
            bestcomb=altcomb;
            bestcost=costcmb(bestcomb,D);
        }
    }
    return {bestcomb:bestcomb, bestcost:bestcost};

}
}
