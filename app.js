var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var helmet = require('helmet');
var config = require('app-config');
var csrf = require('csurf');
var compression = require('compression');
var Firebase = require('firebase');

var client = redis.createClient();
var app = express();

var routes = require('./controllers/index');

app.config = config;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser(app.config.web.secret));
app.set('trust proxy', 1); // trust first proxy
app.use(session(
    {
        secret: app.config.web.secret,
        name: 'sess',
        store: new redisStore({ host: 'localhost', port: 6379, client: client }),
        saveUninitialized: false, // don't create session until something stored,
        resave: false // don't save session if unmodified
    }
));
app.use(logger("tiny"));
app.use(helmet());
app.use(compression({}));

app.fb = new Firebase(app.config.db.url);
app.csrf = csrf({});
/*
 app.use(function (err, req, res, next) {
 if (err.code !== 'EBADCSRFTOKEN') return next(err)

 // handle CSRF token errors here
 res.status(403)
 res.send('form tampered with')
 })
 */

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

