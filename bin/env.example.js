var config = {};

config.web = {};
config.web.port = process.env.WEB_PORT || 3000;

config.firebase = {};
config.firebase.url = '';
config.firebase.secret = '';

module.exports = config;
