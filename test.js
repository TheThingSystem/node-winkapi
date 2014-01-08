var WinkAPI = require('./winkapi');

var clientID     = '...'
  , clientSecret = '...'
  , userName     = 'mrose17@gmail.com'
  , passPhrase   = '...'
  , winkapi
  ;

winkapi = new WinkAPI.WinkAPI({ clientID: clientID, clientSecret: clientSecret }).login(userName, passPhrase, function(err) {
  if (!!err) return console.log('login error: ' + err.message);

  winkapi.getUser(function(err, code, results) {
    if (!!err) return console.log('getUser: ' + err.message);

    console.log('user:'); console.log(results);
  }).getDevices(function(err, code, results) {
    if (!!err) return console.log('getDevices: ' + err.message);

    console.log('devices:'); console.log(results);
  });
}).on('error', function(err) {
  console.log('background error: ' + err.message);
});
