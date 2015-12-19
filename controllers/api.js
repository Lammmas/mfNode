var express = require('express');
var Firebase = require('firebase');
var fbToken = require('firebase-token-generator');
var config = require('app-config');
var router = express.Router();
var fb = new Firebase(config.db.url);
var tokenGenerator = new fbToken(config.db.secret);

//var fbUsers = app.fb.child('users');
//var fbClasses = app.fb.child('classes');
//var fbRegistrations = app.fb.child('registrations');
//var fbLocations = app.fb.child('locations');

function isAuthenticated(req, res, next) {
    var user = req.session.user;

    if (user.token) return next();

    res.redirect('/');
}

router.get('/', isAuthenticated, function (req, res) {
    res.send('Welcome! <br><img src="' + req.session.user.profileImageURL + '" />');
});

router.get('/classes', isAuthenticated, function (req, res) {
    res.send('List classes');
});

router.get('/classes/:class', isAuthenticated, function (req, res) {
    res.send('List classes');
});

router.get('/locations', isAuthenticated, function (req, res) {
    res.send('List locations');
});

router.get('/locations/:location', isAuthenticated, function (req, res) {
    res.send('List locations');
});

router.route('/reservations')
    .get(function (req, res) {
    res.send('List registrations');
})
    .post(function (req, res) {
    res.send('Register for a class');
})
    .delete(function (req, res) {
    res.send('Unregister from a class');
});

router.get('/reservations/:reservation', isAuthenticated, function (req, res) {
    res.send('View reservation');
});

module.exports = router;
