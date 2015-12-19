var express = require('express');
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
                console.log("Login Failed!", error);
                res.redirect('/login');
            } else {
                var user = {};
                for (var attr in authData.password) { user[attr] = authData.password[attr]; }
                for (var attr in authData.auth) { user[attr] = authData.password[attr]; }
                user['token'] = authData.token;

                req.session.user = user;
                req.session.save();

                res.redirect('/api');
            }
        });
    }
);

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
                console.log("Error creating user:", error);
                req.flash('error', error);
            } else {
                console.log("Successfully created user account with uid:", userData.uid);
                req.flash('success', 'Account created, you can now log in');

                fb.child("users").child(userData.uid).set({
                    provider: userData.provider,
                    name: function (userData) {
                        switch (userData.provider) {
                            case 'password':
                                return userData.password.email.replace(/@.*/, '');
                            case 'google':
                                return userData.google.displayName;
                            case 'facebook':
                                return userData.facebook.displayName;
                        }
                    }
                });
            }

            res.redirect('/login');
        });
    }
);

router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
