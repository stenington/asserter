#!/usr/bin/env node

const path = require('path');

const PORT = process.env['PORT'] || 8888;
const STATIC_DIR = process.env['STATIC_DIR'];
const DATA_DIR = process.env['DATA_DIR'];

var app = require('../').app.build({
  dataDir: path.join(__dirname, '..', STATIC_DIR),
  staticDir: path.join(__dirname, '..', DATA_DIR)
});
app.listen(PORT, function() {
  console.log("Listening on port " + PORT + ".");
});