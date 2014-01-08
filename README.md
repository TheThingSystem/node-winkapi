node-winkapi
============

**NB: this module is not completed yet. soon, very soon!**

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

    - Lauch either the [iOS](https://itunes.apple.com/us/app/wink-instantly-connected/id719287124?mt=8)
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

### Get user information

    winkapi.getUser(function(err, code, user) {
      if (!!err) return console.log('getUser: ' + err.message);

      // inspect user
    }

### Get device information

    winkapi.getDevices(function(err, code, devices) {
      if (!!err) return console.log('getDevices: ' + err.message);

      // inspect devices
    }


## For the Future
- Sharing
- Triggers
- Alarms
- Schedules

Finally
-------

Enjoy!
