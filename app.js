var fs = require('fs');
var http = require('http');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var config = require('./config');
var mp = require('./controllers/wechat_mp');
//var corp = require('wechat-enterprise');

var app = express();

app.use(express.query());
app.use('/assets', express.static(__dirname + '/assets', { maxAge: 86400000 }));
app.use(cookieParser());
app.use(session({secret: config.secret}));

app.use('/wechat/callback', mp.callback);
app.use('/wechat', mp.reply);
app.use('/detail', mp.detail);
app.use('/login', mp.login);
//app.use('/corp', corp(config.corp, function (req, res, next) {
//  res.writeHead(200);
//  res.end('hello node api');
//}));

app.use('/', function (req, res) {
  res.writeHead(200);
  res.end('hello gamepoch!');
});

/**
 * Error handler
 */
app.use(function (err, req, res) {
  console.log(err.message);
  console.log(err.stack);
  res.statusCode = err.status || 500;
  res.end(err.message);
});

var server = http.createServer(app);
var worker = require('pm').createWorker();
worker.ready(function (socket) {
  server.emit('connection', socket);
});

app.listen(80);
