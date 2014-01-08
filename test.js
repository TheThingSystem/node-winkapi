var WinkAPI = require('./winkapi');

var clientID     = '...'
  , clientSecret = '...'
  , userName     = 'mrose17@gmail.com'
  , passPhrase   = '...'
  , winkapi
  ;

winkapi = new WinkAPI.WinkAPI({ clientID: clientID, clientSecret: clientSecret }).login(userName, passPhrase, function(err) {
  if (!!err) return console.log('login error: ' + err.message);

  winkapi.getUser(function(err, user) {
    if (!!err) return console.log('getUser: ' + err.message);

    console.log('user:'); console.log(user);
  }).getDevices(function(err, devices) {
    if (!!err) return console.log('getDevices: ' + err.message);

    console.log('devices:'); console.log(devices);
  }).getIcons(function(err, icons) {
    if (!!err) return console.log('getIcons: ' + err.message);

    console.log('icons:'); console.log(icons);
  }).getChannels(function(err, channels) {
    if (!!err) return console.log('getChannels: ' + err.message);

    console.log('channels:'); console.log(channels);
  }).getServices(function(err, services) {
    if (!!err) return console.log('getServices: ' + err.message);

    console.log('services:'); console.log(services);
  });
}).on('error', function(err) {
  console.log('background error: ' + err.message);
});
