// winkapi.js
//   cf., http://docs.wink.apiary.io


var https       = require('https')
  , events      = require('events')
  , url         = require('url')
  , util        = require('util')
  ;


var DEFAULT_CONFIG = { clientID     : ''
                     , clientSecret : ''
                     };

var DEFAULT_LOGGER = { error   : function(msg, props) { console.log(msg); if (!!props) console.log(props);             }
                     , warning : function(msg, props) { console.log(msg); if (!!props) console.log(props);             }
                     , notice  : function(msg, props) { console.log(msg); if (!!props) console.log(props);             }
                     , info    : function(msg, props) { console.log(msg); if (!!props) console.log(props);             }
                     , debug   : function(msg, props) { console.log(msg); if (!!props) console.log(props);             }
                     };


var WinkAPI = function(options) {
  var k;

  var self = this;

  if (!(self instanceof WinkAPI)) return new WinkAPI(options);

  self.options = options;

  self.config = self.options.config || {};
  for (k in DEFAULT_CONFIG) {
    if ((DEFAULT_CONFIG.hasOwnProperty(k)) && (typeof self.config[k] === 'undefined'))  self.config[k] = DEFAULT_CONFIG[k];
  }

  self.logger = self.options.logger  || {};
  for (k in DEFAULT_LOGGER) {
    if ((DEFAULT_LOGGER.hasOwnProperty(k)) && (typeof self.logger[k] === 'undefined'))  self.logger[k] = DEFAULT_LOGGER[k];
  }

  self.oauth = {};
};
util.inherits(WinkAPI, events.EventEmitter);


WinkAPI.prototype.login = function(username, passphrase, callback) {
  var json;

  var self = this;

  if (typeof callback !== 'function') throw new Error('callback is mandatory for login');

  json = { username      : username
         , client_secret : self.options.clientSecret
         , password      : passphrase
         , client_id     : self.options.clientID
         , grant_type    : 'password'
         };
  self.invoke('POST', '/oauth2/token', json, function(err, code, results) {
    if (!!err) callback(err);

    if (code !== 201) {
      return callback(new Error('invalid credentials: '
                        + (((!!results) && (!!results.data) && (!!results.data.error) ? results.data.error
                                                                                      : JSON.stringify(results)))));
    }

    if (!results.data) return callback(new Error('invalid response: ' + JSON.stringify(results)));
    self.oauth = results.data;
    callback(null);
  });

  return self;
};

WinkAPI.prototype.getUser = function(callback) {
  return this.invoke('GET', '/users/me', callback);
};

WinkAPI.prototype.getDevices = function(callback) {
  var self = this;

  return this.invoke('GET', '/users/me/wink_devices', function(err, code, results) {
    var device, devices, k;

    if (!!err) return callback(err);

/*
    var f = function(device) {
      var g = { cloud_clock   : function() {
                                }
              , eggtray       : function() {
                                }
              , piggy_bank    : function() {
                                  return '/piggy_bank/' + device.id;
                                }
              , powerstrip    : function() {
                                }
              , sensor_pod    : function() {
                                  return '/sensor_pod/' + device.id;
                                }
              }[device.type];

      if (!!g) return g();
    };

    if ((!util.isArray(results)) || (results.length !== 1)) {
      self.logger.error('getDevices', { event: 'https', results: results });
      return callback(new Error('invalid response'));
    }
    results = results[0];

    devices = {};
    for (k in results) if ((results.hasOwnProperty(k)) && (k.lastIndexOf('_id') === k.length - 3)) {
    }
 */devices = results;

    callback(null, code, devices);
  });
};


WinkAPI.prototype.invoke = function(method, path, json, callback) {
  var options;

  var self = this;

  if (typeof json === 'function') {
    callback = json;
    json = null;
  }
  if (!callback) {
    callback = function(err, results) {
      if (!!err) self.logger.error('invoke', { exception: err }); else self.logger.info(path, { results: results });
    };
  }

  options = url.parse('https://winkapi.quirky.com' + path);
  options.agent = false;
  options.method = method;
  options.headers = {};
  if (!!json) {
    options.headers['Content-Type'] = 'application/json';
    json = JSON.stringify(json);
  }
  if (!!self.oauth.access_token) options.headers.Authorization = 'Bearer ' + self.oauth_access.token;
console.log('>>> options');console.log(options);
if (!!json) {console.log('>>> body');console.log(json);}

  https.request(options, function(response) {
    var body = '';

    response.on('data', function(chunk) {
      body += chunk.toString();
    }).on('end', function() {
      var expected = { GET    : [ 200 ]
                     , PUT    : [ 200 ]
                     , POST   : [ 200, 201, 202 ]
                     , DELETE : [ 200 ]
                     }[method];

      var results = {};

      try { results = JSON.parse(body); } catch(ex) {
        self.logger.error(path, { event: 'json', diagnostic: ex.message, body: body });
        return callback(ex, response.statusCode);
      }

      if (expected.indexOf(response.statusCode) === -1) {
         self.logger.error(path, { event: 'https', code: response.statusCode, body: body });
         return callback(new Error('HTTP response ' + response.statusCode), response.statusCode, results);
      }

      callback(null, response.statusCode, results);
    }).on('close', function() {
      callback(new Error('premature end-of-file'));
    }).setEncoding('utf8');
  }).on('error', function(err) {
    callback(err);
  }).end(json);

  return self;
};


exports.WinkAPI = WinkAPI;
