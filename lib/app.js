var fs = require('fs');
var http = require('http');
var path = require('path');
var format = require('util').format;
var express = require ('express');

function error(code, msg){
  var err = new Error(msg || http.STATUS_CODES[code]);
  err.status = code;
  return err;
};

exports.build = function build(options) {
  var dataDir = options.dataDir;
  var staticDir = options.staticDir;
  if (!dataDir || !staticDir) 
    throw 'Must provide both dataDir and staticDir options';

  downgrade = function downgrade(data) {
    return data;
  }

  function relocateParts(structures, base, staticBase) {
    structures.assertion.badge = base + 'badge.json';
    structures.assertion.verify.url = base + 'assertion.json';
    structures.badge.issuer = base + 'issuer.json';
    structures.badge.image = staticBase + 'unbaked.png';
    return structures;
  }

  var app = express();
  app.use(express.static(staticDir));

  app.param('data', function(req, res, next, id) {
    var file = !path.extname(id) ? id + '.json' : id;
    fs.readFile(path.join(dataDir, file), function(err, contents) {
      if (err)
        return next(error(404, file + ' not found'));
      try {
        req.dataId = id;
        req.data = JSON.parse(contents);
        return next();
      }
      catch (e) {
        return next('Unable to parse as JSON: ' + e.message);
      }
    });
  });

  app.param('version', function(req, res, next, version) {
    switch(version) {
      case '0.5':
      case '0.5.0':
        return next('0.5 not implemented'); /** TEMPORARY **/
        req.structures = downgrade(req.data);
        break;
      case '1.0':
      case '1.0.0':
        var base = format('%s://%s/%s/%s/', req.protocol, req.headers.host, req.dataId, version);
        var staticBase = req.protocol + '://' + req.headers.host + '/'; 
        req.structures = relocateParts(req.data, base, staticBase);
        break;
      default:
        return next('Unrecognized version: ' + version);
    }
    return next();
  });

  app.get('/:data/:version/:structure.json', function(req, res, next) {
    var data = req.param('data');
    var version = req.param('version');
    var structure = req.param('structure');
    if (!req.structures || !req.structures[structure])
      return next(format('Invalid structure %s for %s (%s)', structure, data, version));
    return res.json(200, req.structures[structure]);
  });

  app.use(function(err, req, res, next){
    var status = err.status || 500;
    res.json(status, { 
      status: status, 
      message: err.toString() 
    });
  });
  
  app.getUrl = function getUrl(path) {
    path = path || '';
    return 'http://127.0.0.1:' + this.server.address().port + path;
  };

  return app;
}
