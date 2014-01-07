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

    var winkapi = new WinkAPI.WinkAPI(options).login(function(username, passphrase, err) {
      if (!!err) ...

      // otherwise, good to go!
    }).on('error', function(err) {
      // for background errors
    });

### Get user information

    winkapi.getUser(function(err, results) {
      if (err) return console.log('getUser: ' + err.message);
      if (results.status !== 'ok')  { console.log('getUser not ok'); return console.log(results); }

      // inspect results.body
    }

### Get device information

    winkapi.getDevices(function(err, results) {
      if (err) return console.log('getDevices: ' + err.message);
      if (results.status !== 'ok')  { console.log('getDevices not ok'); return console.log(results); }

      // inspect results.body
    }


Finally
-------

Enjoy!
