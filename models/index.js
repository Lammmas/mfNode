var Firebase = require('firebase');
var debug = require('debug')('models');
var config = require('app-config');

// Basic abstract model that acts as a FireBase wrapper
function Model(name) {
    this.name = name;
    this.id = null;

    var fb = new Firebase(config.db.url);
    var auth = function () {
        var success = true;

        fb.unauth();
        fb.authWithCustomToken(config.db.secret, function (error, authData) {
            if (error) {
                success = false;
                console.log("Model auth Failed!", error);
            }
        });

        return success;
    };

    auth();

    var r = fb.child(name);
    var length = 100;
    var order = "asc";
    var customOrder = false;

    this.auth = function (provider, value, callback) {
        var success = true;

        if (provider == "password") {
            fb.authWithPassword({
                email: value.email,
                password: value.password
            }, function (error, authData) {
                if (error) success = false;
                else callback(authData);
            });

            return success;
        } else if (provider == "token") {
            fb.authWithCustomToken(value, function(error, authData) {
                if (error) success = false;
                else callback(authData);
            });

            return success;
        } else if (provider == "admin") return auth();

        return this;
    };

    this.replace = function (id, data) {
        r.child(id).set(data);
        this.id = id;

        return this;
    };

    this.update = function (id, data) {
        r.child(id).update(data);
        this.id = id;

        return this;
    };

    this.insert = function (data) {
        r.push(data);
        this.id = r.key();

        return this;
    };

    this.get = function () {
        var entries = {};

        if (order == "asc") r.limitToFirst(length);
        else r.limitToLast(length);

        if (customOrder === false) r.orderByKey();

        r.once('value', function (snapshot) {
            snapshot.forEach(function(data) {
                entries[data.key()] = data.val();
            });
        });

        return entries;
    };

    this.between = function (min, max) {
        if (min !== undefined && min !== null) r.startAt(min);
        if (max !== undefined && max !== null) r.endAt(max);

        return this
    };

    this.limit = function(l) {
        length = l;

        return this;
    };

    this.where = function (col, val) {
        r = r.orderBy(col).equalTo(val);
        return this;
    };

    this.order = function (dir) {
        order = dir.toLowerCase();
        r = r.orderByKey();
        customOrder = true;
        return this;
    };

    this.orderBy = function (col, dir) {
        order = dir.toLowerCase();
        r = r.orderBy(col);
        customOrder = true;
        return this;
    };
}

module.exports = Model;
