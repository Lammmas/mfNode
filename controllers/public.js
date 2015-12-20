var express = require('express');
var debug = require('debug')('public');
var config = require('app-config');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('index');
});

router.route('/login')
    .get(function (req, res) {
        res.render('login');
    }).post(function (req, res) {
        var Firebase = require('firebase');
        var fb = new Firebase(config.db.url);
        var data = req.body;

        fb.authWithPassword({
            email: data.email,
            password: data.pass
        }, function(error, authData) {
            if (error) {
                debug("Login Failed!", error);
                res.redirect('/login');
            } else {
                var userId = authData.uid;
                var user = {
                    id: userId,
                    email: authData.password.email,
                    image: authData.password.profileImageURL,
                    token: authData.token
                };

                req.session.user = user;
                req.session.save();

                // Check if user is already stored AKA this is not the first sign in
                // TODO: replace with local version, ex. MongoDB or even a JSON file with user IDs
                fb.child('users/' + userId).once('value', function(snapshot) {
                    if (!snapshot.exists()) {
                        fb.child('users/' + userId).set(user, function (err) {
                            if (err !== null) console.log(err);
                        });
                    }
                });

                res.redirect('/api');
            }
        });
    }
);

router.get('/auth/:token', function (req, res) {
    // TODO: Figure out RESTful auth
    // Maybe could use the Token generated @ register to look up users to auth?
});

router.route('/register').get(function (req, res) {
        res.render('register');
    }).post(function (req, res) {
        var Firebase = require('firebase');
        var fb = new Firebase(config.db.url);
        var data = req.body;

        fb.createUser({
            email: data.email,
            password: data.pass
        }, function(error, userData) {
            if (error) {
                switch (error.code) {
                    case "EMAIL_TAKEN":
                        debug("The new user account cannot be created because the email is already in use.");
                        break;
                    case "INVALID_EMAIL":
                        debug("The specified email is not a valid email.");
                        break;
                    default:
                        console.log("Error creating user:", error);
                }
                req.flash('error', error);
            } else {
                req.flash('success', 'Account created, you can now log in');
                // Automatic login achievable via Token generated from userData.uid
                res.redirect('/login');
            }

        });
    }
);

router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
