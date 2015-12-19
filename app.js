var flash = require('connect-flash');
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

var client = redis.createClient();
var app = express();

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
        cookie: {
            path: '/',
            httpOnly: true,
            //secure: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            signed: false
        },
        secret: app.config.web.secret,
        name: 'sess',
        store: new redisStore({ host: 'localhost', port: 6379, client: client }),
        /*
        store: new mongoStore({
            url: 'mongodb://' + app.config.db.mongo.user + ':' + app.config.db.mongo.password + '@' +
            app.config.db.mongo.url + '?authSource=admins&w=1'
            ttl: 14 * 24 * 60 * 60, // = 14 days
            touchAfter: 24 * 3600 // time period in seconds to refresh the session data if nothing is changeds
        }),*/
        saveUninitialized: false, // don't create session until something stored,
        resave: false // don't save session if unmodified
    }
));
app.use(logger("tiny"));
app.use(helmet());
app.use(compression({}));
app.csrf = csrf({});
/*
 app.use(function (err, req, res, next) {
 if (err.code !== 'EBADCSRFTOKEN') return next(err)

 // handle CSRF token errors here
 res.status(403)
 res.send('form tampered with')
 })
 */

app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// routes
app.use('/', require('./controllers/public'));
app.use('/api', require('./controllers/api'));

// development error handler
// will print stacktrace
if (app.get('env') === 'dev') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// error handlers
app.use(require('./middleware/errors'));

module.exports = app;
