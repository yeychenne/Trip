// config/authLoc.js
// expose our config directly to our application using module.exports

module.exports = {
    
    'facebookAuth' : {
        'clientID'      : '644953402302842', // your App ID
        'clientSecret'  : '064f0a2e9d40b4a67e951bd23d428a6d', // your App Secret
        'callbackURL'   : 'http://localhost:6004/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'LICjNPXKUFLEWyVVSxrf1OkMt',
        'consumerSecret'    : '2Lz773X7dI4SA9TH8u3d3n7vMCAxs9LWZpFq94ao5wtaqyNHeQ',
        'callbackURL'       : 'http://127.0.0.1:6004/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '57680889922-kd5i024qiu72l428i15he18e59h3do0a.apps.googleusercontent.com',
        'clientSecret'  : 'r7-gYVzg63t1dnkXT6rkIJve',
        'callbackURL'   : 'http://localhost:6004/auth/google/callback',
        'APIkey'        : 'AIzaSyA8_1TWelRjU6PyePljGZzqaP2eaG8vPEk'
    }
};