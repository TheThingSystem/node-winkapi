node-winkapi
============

A node.js module to interface with the [Quirky](http://www.quirky.com/) [Wink API](http://docs.wink.apiary.io).

Before Starting
---------------
You will need OAuth tokens and a Wink account:

- To get the OAuth tokens:

    - Make sure you have a Quirky account;
if not, go to [quirky.com](http://www.quirky.com/) and click on _SIGN UP_ (in the upper right-hand corner).

    - Send an email to [questions@quirky.com](mailto:questions@quirky.com) and request access to the Wink API.

- To get a Wink account:

    - Attach a [Wink-capable device](http://www.quirky.com/shop/smart-home) to your network.

    - Launch either the [iOS](https://itunes.apple.com/us/app/wink-instantly-connected/id719287124?mt=8)
or [Android](https://play.google.com/store/apps/details?id=com.quirky.android.wink.wink&hl=en) app on your smart phone/tablet.

    - Follow the directions to create an account.


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
      if (!!err) return console.log('login error: ' + err.message);

      // otherwise, good to go!
    }).on('error', function(err) {
      console.log('background error: ' + err.message);
    });

### Get/Set user information

    winkapi.getUser(function(err, user) {
      if (!!err) return console.log('getUser: ' + err.message);

      // inspect user{}
    });

    winkapi.setUser({ name: '...' }, function(err, user) {
      if (!!err) return console.log('setUser: ' + err.message);

      // inspect user{}
    });

### Get/Set device information

    winkapi.getDevices(function(err, devices) {
      if (!!err) return console.log('getDevices: ' + err.message);

      // inspect devices[{}]
    });

    winkapi.getDevice(device, function(err, device) {
      if (!!err) return console.log('getDevice: ' + err.message);

      // inspect device{}
    });

    winkapi.setDevice(device, { name: ... }, function(err, device) {
      if (!!err) return console.log('setDevice: ' + err.message);

      // inspect device{}
    });

### Get icon information

    winkapi.getIcons(function(err, icons) {
      if (!!err) return console.log('getIcons: ' + err.message);

      // inspect icons[{}]
    });

### Get channel information

    winkapi.getChannels(function(err, channels) {
      if (!!err) return console.log('getChannels: ' + err.message);

      // inspect channels[{}]
    });

    winkapi.getDialTemplates(function(err, dialTemplates) {
      if (!!err) return console.log('getDialTemplates: ' + err.message);

      // inspect dialTemplates[{}]
    });

### Get/Set linked service information

    winkapi.getServices(function(err, services) {
      if (!!err) return console.log('getServices: ' + err.message);

      // inspect services[{}]
    });

    winkapi.newService({ service: '...', account: '...' }, function(err, service) {
      if (!!err) return console.log('setService: ' + err.message);

      // inspect service{}
    });

### Get/Set trigger information

    winkapi.getTrigger(id, function(err, trigger) {
      if (!!err) return console.log('getTrigger: ' + err.message);

      // inspect trigger{}
    });

    winkapi.setTrigger('1', { enabled: true }, function(err, trigger) {
      if (!!err) return console.log('setTrigger: ' + err.message);

      // inspect trigger{}
    });

### Get/Set dial-related information

    winkapi.getDialTemplates(function(err, dialTemplates) {
      if (!!err) return console.log('getDialTemplates: ' + err.message);

      // inspect dialTemplates[{}]
    });

    winkapi.setDial(dial, { enabled: true }, function(err, dial) {
      if (!!err) return console.log('setDial: ' + err.message);

      // inspect dial{}
    });

    winkapi.setDialValue(dial, value, callback) {
      if (!!err) return console.log('setDialValue: ' + err.message);

      // inspect dial{}
    }

    winkapi.setDialLabels(dial, mainLabel, secondaryLabel, callback) {
      if (!!err) return console.log('setDialLabels: ' + err.message);

      // inspect dial{}
    }

### Set outlet-related information

    winkapi.setOutlet(outlet, { powered: true }, function(err, outlet) {
      if (!!err) return console.log('setOutlet: ' + err.message);

      // inspect outlet{}
    });

## For the Future
- Sharing
- Alarms
- Schedules

Finally
-------

Enjoy!
