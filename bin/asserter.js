#!/usr/bin/env node

const path = require('path');

const PORT = process.env['PORT'] || 8888;

var app = require('../').app.build({
  dataDir: path.join(__dirname, '../test/data'),
  staticDir: path.join(__dirname, '../test/static')
});
app.listen(PORT, function() {
  console.log("Listening on port " + PORT + ".");
});