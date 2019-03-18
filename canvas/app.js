"use strict";

var express = require('express');
var app = express();
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

module.exports = app;