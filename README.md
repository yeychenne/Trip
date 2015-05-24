#Trip planning app
Innovation project @CentraleSupelec

hosted on Bluemix [link](http://trip16.mybluemix.net/)

—————————————————
###Requisites:
1. Node     [download](https://nodejs.org/download/)
2.  NPM     [download](https://www.npmjs.com/package/npm)
3.  Mongodb (if running locally)  [download](https://www.mongodb.org/downloads)


—————————————————
###To run the app locally:

1. npm install
2. npm start  ( or [nodemon](http://nodemon.io/) server.js)

        server starting on http://localhost:****
3. Listen to the allocated port

###Config:
1. Mongodb database at databse.js
2.  Passport credentials at auth.js

-------
### Project tree:
    ├── README.md
    ├── app
    │   ├── models.js
    │   ├── optimize.js
    │   ├── trip_routes.js
    │   └── user_routes.js
    ├── config
    │   ├── auth.js  //hidden
    │   ├── database.js  //hidden
    │   └── passport.js
    ├── manifest.yml
    ├── package.json
    ├── public
    │   ├── img
    │   │   ├── favicon.ico
    │   │   └── marker.png
    │   ├── js
    │   │   └── facebook.js
    │   └── stylesheets
    │       ├── mapstyle.css
    │       └── timeline.css
    ├── server.js
    ├── test.txt
    └── views
        ├── 404.jade
        ├── connect-local.jade
        ├── editsites.jade
        ├── index.jade
        ├── login.jade
        ├── optimize.jade
        ├── profile.jade
        ├── recap.jade
        └── signup.jade
