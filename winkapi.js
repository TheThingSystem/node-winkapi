// winkapi.js
//   cf., http://docs.wink.apiary.io


var https       = require('https')
  , events      = require('events')
  , url         = require('url')
  , util        = require('util')
  ;


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
    var data, errors;

    if (!!err) callback(err);

    data = results.data;
    errors = (!!results.errors) && util.isArray(results.errors) && (results.errors.length > 0) && results.errors;
    if ((!!errors) || (!data)) {
      return callback(new Error('invalid credentials: ' + JSON.stringify(!!errors ? errors : results)));
    }

    self.oauth = results.data;
    callback(null);
  });

  return self;
};

WinkAPI.prototype._refresh = function(callback) {
  var json;

  var self = this;

  if (typeof callback !== 'function') throw new Error('callback is mandatory for refresh');

  json = { client_id     : self.options.clientID
         , client_secret : self.options.clientSecret
         , refresh_token : self.oauth.refresh_token
         , grant_type    : 'refresh_token'
         };
  self.invoke('POST', '/oauth2/token', json, function(err, code, results) {
    var data, errors;

    if (!!err) callback(err);

    data = results.data;
    errors = (!!results.errors) && util.isArray(results.errors) && (results.errors.length > 0) && results.errors;
    if ((!!errors) || (!data)) {
      return callback(new Error('invalid credentials: ' + JSON.stringify(!!errors ? errors : results)));
    }

    self.oauth = results.data;
    callback(null);
  });

  return self;
};


WinkAPI.prototype.getUser = function(callback) {
  return this.roundtrip('GET', '/users/me', callback);
};

WinkAPI.prototype.setUser = function(props, callback) {
  return this.roundtrip('PUT', '/users/me', props, callback);
};

WinkAPI.prototype.getDevices = function(callback) {
  var self = this;

  return self.invoke('GET', '/users/me/wink_devices', function(err, code, results) {
    var data, datum, devices, errors, i, k;

    if (!!err) return callback(err);

    data = results.data;
    errors = (!!results.errors) && util.isArray(results.errors) && (results.errors.length > 0) && results.errors;
    if ((!!errors) || (!data) || (!util.isArray(data))) {
      return callback(new Error('invalid response: ' + JSON.stringify(!!errors ? errors : results)));
    }

    devices = [];
    for (i = 0; i < data.length; i++) {
      datum = data[i];

      for (k in datum) if ((datum.hasOwnProperty(k)) && (k.indexOf('_id') === (k.length - 3))) {
        devices.push({ id      : datum[k]
                     , type    : k.slice(0, -3)
                     , name    : datum.name
                     , path    : '/' + k.slice(0, -3) + 's/' + datum[k]
                     , dials   : self._children(datum, 'dials')
                     , outlets : self._children(datum, 'outlets')
                     , props   : datum
                     });
        break;
      }
    }

    callback(null, devices);
  });
};

WinkAPI.prototype.getDevice = function(device, callback) {
  var self = this;

  return self.roundtrip('GET', device.path, function(err, datum) {
    var k;

    if (!!err) return callback(err);

    for (k in datum) if ((datum.hasOwnProperty(k)) && (k.indexOf('_id') === (k.length - 3))) {
      return callback(null, { id      : datum[k]
                            , type    : k.slice(0, -3)
                            , name    : datum.name
                            , path    : '/' + k.slice(0, -3) + 's/' + datum[k]
                            , dials   : self._children(datum,  'dials')
                            , outlets : self._children(datum, 'outlets')
                            , props   : datum
                            });
    }

    callback(null, null);
  });
};

WinkAPI.prototype._children = function(datum, prefix) {
  var child, children, i, id, type;

  if (!datum[prefix]) return null;

  children = {};

  type = prefix.slice(0, -1);
  id = type + '_id';
  for (i = 0; i < datum[prefix].length; i++) {
    child = datum[prefix][i];
    if (!child[id]) continue;

    children[child[id]] = { id    : child[id]
                          , type  : type
                          , name  : child.name
                          , path  : '/' + prefix + '/' + child[id]
                          , props : child
                          };
  }

  return children;
};

WinkAPI.prototype.setDevice = function(device, props, callback) {
  var self = this;

  return self.roundtrip('PUT', device.path, props, function(err, datum) {
    if (!!err) return callback(err);

    return callback(null, { id      : device.id
                          , type    : device.type
                          , name    : device.name
                          , path    : device.path
                          , dials   : self._children(datum,  'dials')
                          , outlets : self._children(datum, 'outlets')
                          , props   : datum
                          });
  });
};

WinkAPI.prototype.getIcons = function(callback) {
  return this.roundtrip('GET', '/icons', callback);
};

WinkAPI.prototype.getChannels = function(callback) {
  return this.roundtrip('GET', '/channels', callback);
};

WinkAPI.prototype.getServices = function(callback) {
  return this.roundtrip('GET', '/users/me/linked_services', callback);
};

WinkAPI.prototype.newService = function(props, callback) {
  return this.roundtrip('POST', '/users/me/linked_services', props, callback);
};

WinkAPI.prototype.getTrigger = function(id, callback) {
  return this.roundtrip('GET', '/triggers/' + id, callback);
};

WinkAPI.prototype.setTrigger = function(id, props, callback) {
  return this.roundtrip('PUT',  '/triggers/' + id, props, callback);
};

WinkAPI.prototype.getDialTemplates = function(callback) {
  return this.roundtrip('GET', '/dial_templates', callback);
};

WinkAPI.prototype.setDial = function(dial, props, callback) {
  var json;

  var self = this;
if(!dial.props){console.log('>>> <<<');console.log(dial);}

  json = { name                  : props.name                  || dial.props.name
         , label                 : props.label                 || dial.props.label
         , labels                : props.labels                || dial.props.labels
         , position              : props.position              || dial.props.position
         , brightness            : props.brightness            || dial.props.brightness
         , channel_configuration : props.channel_configuration || dial.props.channel_configuration 
         , dial_configuration    : props.dial_configuration    || dial.props.dial_configuration
         };
  return self.roundtrip('PUT', dial.path, json, function(err, datum) {
    if (!!err) return callback(err);

    return callback(null, { id      : dial.id
                          , type    : dial.type
                          , name    : dial.name
                          , path    : dial.path
                          , props   : datum
                          });
  });
};


WinkAPI.prototype.roundtrip = function(method, path, json, callback) {
  var self = this;

  if ((!callback) && (typeof json === 'function')) {
    callback = json;
    json = null;
  }

  return self.invoke(method, path, json, function(err, code, results) {
    var data, errors;

    if (!!err) return callback(err);

    data = results.data;
    errors = (!!results.errors) && util.isArray(results.errors) && (results.errors.length > 0) && results.errors;
    if ((!!errors) || (!data)) {
      return callback(new Error('invalid response: ' + JSON.stringify(!!errors ? errors : results)));
    }

    callback(null, data);
  });
};

WinkAPI.prototype.invoke = function(method, path, json, callback) {
  var options;

  var self = this;

  if ((!callback) && (typeof json === 'function')) {
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
  if ((!!self.oauth.access_token) && ((!json) || (!json.grant_type))) {
    options.headers.Authorization = 'Bearer ' + self.oauth.access_token;
  }
  if (!!json) {
    options.headers['Content-Type'] = 'application/json';
    json = JSON.stringify(json);
    options.headers['Content-Length'] = Buffer.byteLength(json);
  }

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
