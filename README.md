node-winkapi
============

A node.js module to interface with the [Quirky](http://www.quirky.com/) [Wink API](http://docs.wink.apiary.io).

Install
-------

    npm install winkapi

API
---

### Load

    var WinkAPI = require('node-winkapi');

### Login to cloud

    var clientID     = '...'
      , clientSecret = '...'
      , userName     = '...'
      , passPhrase   = '...'
      , winkapi
      ;

    winkapi = new WinkAPI.WinkAPI({ clientID     : clientID
                                  , clientSecret : clientSecret }).login(userName, passPhrase, function(err) {
      if (!err) return console.log('login error: ' + err.message);

      // otherwise, good to go!
    }).on('error', function(err) {
      console.log('background error: ' + err.message);
    });

### Get user information

    winkapi.getUser(function(err, results) {
      if (!!err) return console.log('getUser: ' + err.message);

      // inspect results
    }

### Get device information

    winkapi.getDevices(function(err, results) {
      if (!!err) return console.log('getDevices: ' + err.message);

      // inspect results
    }


Finally
-------

Enjoy!
