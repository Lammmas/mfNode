var handlers = [];

// catch 404 and forward to error handler
handlers.push(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

handlers.push(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = handlers;
