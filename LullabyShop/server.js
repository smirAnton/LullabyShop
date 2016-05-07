'use strict';

var mongoose = require('mongoose');
var socketio = require('socket.io');
var logger   = require('./helpers/logger')(module);
var http     = require('http');
var env            = process.env || 'development';
var db;

// for chat clients
global.clients = {};

require('./config/' + env.NODE_ENV);

mongoose.connect(env.DB_HOST, env.DB_NAME, env.DB_PORT, {
    user: env.DB_USER,
    pass: env.DB_PASS
});

db = mongoose.connection;

db.on('error', console.error.bind(console, 'mongodb connection error:'));

db.once('connected', function callback() {
    var app = require('./app')(db);
    var server;
    var port;

    require('./routes/index')(app);

    port   = parseInt(env.PORT) || 3000;
    server = http.createServer(app).listen(port);

    require('./socketio')(server);

    server.on('listening', function() {
        logger.info('Listening on http://localhost:' + port + '/');
    });

    server.on('error', function(err) {
        logger.error(err);
        process.exit(1);
    });
});

