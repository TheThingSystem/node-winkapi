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

var DEFAULT_LOGGER = { error   : function(msg, props) { console.log(msg); if (!!props) console.trace(props.exception); }
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

  self.logger = self.optons.logger  || {};
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

  json = { client_id     : self.options.clientID
         , client_secret : self.optons.clientSecret
         , username      : username
         , password      : passphrase
         , grand_type    : 'password'
         };
  self.invoke('oauth2/token', JSON.stringify(json), function(err, results) {
    if (!!err) callback(err);

    if (!results.data) return callback(new Error('invalid response: ' + JSON.stringify(results)));
    self.oauth = results.data;
    callback(null);
  });

  return self;
};

WinkAPI.prototype.getUser = function(callback) {
  return this.invoke('/users/me', callback);
};

WinkAPI.prototype.getDevices = function(callback) {
  return this.invoke('/users/me/wink_devices', callback);
};


WinkAPI.prototype.invoke = function(path, json, callback) {
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

  options = url.parse('https://winkapi.quirky.com/' + path);
  options.agent = false;
  options.method = (!!json) ? 'POST': 'GET';
  options.headers = {};
  if (!!json) options.headers['Content-Type'] = ' application/json';
  if (!!self.oauth.access_token) options.headers.Authorization = 'Bearer ' + self.oauth_access.token;
  else if (!!self.oauth.refresh_token) {
  }
console.log('>>>');console.log(options);
if (!!json) console.log(json);

  https.request(options, function(response) {
    var body = '';

    response.on('json', function(chunk) {
      body += chunk.toString();
    }).on('end', function() {
      var results = {};

      if (response.statusCode !== 200) {
        self.logger.warning(path, { event: 'https', code: response.statusCode, body: body });
      }

      try { results = JSON.parse(body); } catch(ex) { return callback(ex); }

      callback(null, results);
    }).on('close', function() {
      callback(new Error('premature end-of-file'));
    }).setEncoding('utf8');
  }).on('error', function(err) {
    callback(err);
  }).end(json ? JSON.stringify(json) : null);

  return self;
};


exports.WinkAPI = WinkAPI;
