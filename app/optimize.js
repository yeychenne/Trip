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
        var openings=[];
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
                var firstday=new Date(Date.parse(trip.start_date)).getDay();
                var daystart=parseTime(trip.start_time).getHours();
                var dayend=parseTime(trip.end_time).getHours();
                Site.find({'_id': { $in:trip.sites}}).lean().exec(function(err, sites){
                    for (var i=0; i<sites.length;i++){
                        origins.push(sites[i].geometry.coordinates[1]+","+sites[i].geometry.coordinates[0]);
                        nodes.push(sites[i]._id);
                        visits.push(Math.round(sites[i].visit*60));
                        if(sites[i].periods)
                            openings.push(sites[i].periods);
                        }
                    var nodes_size=origins.length;
                    gm.matrix(origins, origins, function (err, distances) {
                        if (!err){
                            dis=new Array(nodes_size);
                            for (var i=0;i<nodes_size;i++){
                                dis[i]=new Array(nodes_size);
                                for (var j=0;j<nodes_size;j++)
                                    dis[i][j]=distances.rows[i].elements[j].duration.value+visits[i];
                            }
                            console.log("Sent: "+{openings:openings});
                            res.json({days: days,firstday:firstday, daystart:daystart, dayend:dayend, visits:visits, matrix:dis, trip:trip,sites:sites, nodes:nodes, openings:openings});
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
               var visits=data.visits;
               var openings=data.openings;
               console.log(openings);
               var days=data.days;
               var firstday=data.firstday;
               var daystart=data.daystart;
               var dayend=data.dayend;
               var delta=28800; //8 hours per day from
               var mybest=roulette(n,delta,D,visits,openings,days,firstday,daystart,dayend,100);
              /* console.log("Sent data:")
               console.log(JSON.stringify(mybest));
               console.log(JSON.stringify(data));*/
               res.render('optimize',{combi: mybest, data:data});
          });
        });
    });

function combi(n,delta,D,openings,days,firstday,daystart,dayend){
    //n is the number of nodes to visit (start=end point not included)
    //D distance matrix
    //delta is the day duration
    //days is the number of days in the trip
    var tovisit = [];
    var open;
    var close;
    var temp;
    var isopen;
    var iters;
    var MAX_ITER=10000;
    for (var i = 1; i <= n; i++) {
        tovisit.push(i);
    }
    var prop=new Array(days);
    for(var i=0;i<days;i++){
        prop[i]=new Array();
        prop[i].push(0); //0 for home node
    }
    for(var i=0;i<days;i++){ //Looping over days
        var time=daystart*3600;
        var day=(daystart+i)%7;
    for (var j=1;j<=n;j++){
        iters=0;
        do {
            // console.log("looking for day="+day);
            temp=Math.floor(Math.random()*(tovisit.length-1));
            for(var k=0;k<openings[temp].length;k++){
                // console.log("openings[temp][k].close="+openings[temp][k].close);
                // console.log("day="+openings[temp][k].close.day);
                if(openings[temp][k].close.day==day){
                    // console.log("Matching found");
                    break;
                }
            }
            if(k<openings[temp].length){
            close=parseInt(openings[temp][k].close.time.substr(0,2))*3600+parseInt(openings[temp][k].close.time.substr(2,2))*60;
            open=parseInt(openings[temp][k].open.time.substr(0,2))*3600+parseInt(openings[temp][k].open.time.substr(2,2))*60;
            isopen=(time+D[prop[i][j-1]][tovisit[temp]]<close && time+D[prop[i][j-1]][tovisit[temp]]>open);
            }
            iters++;}
            while(time+D[prop[i][j-1]][tovisit[temp]]+D[tovisit[temp]][0]>dayend*3600 && iters<MAX_ITER & !isopen)
        if(time+D[prop[i][j-1]][tovisit[temp]]+D[tovisit[temp]][0]>dayend*3600) break;
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
function costcmb(combix,D,visits){
    // To compare two routes we'll choose the ones with less commuting. we're also favorising well distributed routes.
    var days=combix.prop.length;
    var Commut=new Array(days);
    var duration=new Array(days);
    var sum=0;
    var sq=0;
    if (combix.prop==0) return Number.POSITIVE_INFINITY;
    for(var i=0;i<days;i++){
        Commut[i]=D[combix.prop[i][0]][combix.prop[i][1]];
        for(var j=1; j<combix.prop[i].length-1;j++){
            Commut[i]+=D[combix.prop[i][j]][combix.prop[i][j+1]]-visits[combix.prop[i][j]];
            duration[i]+=D[combix.prop[i][j]][combix.prop[i][j+1]];
        }
        sum+=Commut[i];
        sq+=Commut[i]*Commut[i];
    }

    return {cost:sq/days-(sum/days)*(sum/days), Commut:Commut};
}

function roulette(n,delta,D,visits,openings,days,firstday,daystart,dayend,maxiters){
    var bestcomb=combi(n,delta,D,openings,days,firstday,daystart,dayend); //init
    var bestcost=costcmb(bestcomb,D,visits);
    for(var i=0;i<maxiters;i++){
        var altcomb=combi(n,delta,D,openings,days,firstday,daystart,dayend);
        var altcost=costcmb(altcomb,D,visits);
        if(altcost.cost<bestcost.cost){
            bestcomb=altcomb;
            bestcost=costcmb(bestcomb,D,visits);
        }
    }
    return {bestcomb:bestcomb, bestcost:bestcost};

}
function parseTime(timeString) {
        if (timeString == '') return null;

        var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);
        if (time == null) return null;

        var hours = parseInt(time[1],10);
        if (hours == 12 && !time[4]) {
              hours = 0;
        }
        else {
            hours += (hours < 12 && time[4])? 12 : 0;
        }
        var d = new Date();
        d.setHours(hours);
        d.setMinutes(parseInt(time[3],10) || 0);
        d.setSeconds(0, 0);
        return d;
        }
}
