// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '522551094565565', // your App ID
        'clientSecret'  : '32c9f8a67d351f924c588861e3871817', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'i91GTgYtD3Oc6HSlj33ascMlt',
        'consumerSecret'    : '2EKBWI2qdak8MpQKOYRP28VmHC1DHeGKho4q7J94efLKDmGxZu',
        'callbackURL'       : 'http://localhost:3000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '74619892946-vtnffp4e5b9ad3opnd8pre4qp2440lis.apps.googleusercontent.com',
        'clientSecret'  : 'Ab9BQ0js7NIHaMgI4BKVOXB0',
        'callbackURL'   : 'http://127.0.0.1:3000/auth/google/callback',
        'APIkey'        : 'AIzaSyAjBCEJh0Kmvnj14GQ1G0aJ_080T8HkuVA'
    }

};