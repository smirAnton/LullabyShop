'use strict';

var expressSession = require('express-session');
var SessionStore   = require('connect-mongo/es5')(expressSession);
var cookieParser   = require('cookie-parser');
var consolidate    = require('consolidate');
var bodyParser     = require('body-parser');
var mongoose       = require('mongoose');
var socketio       = require('socket.io');
var express        = require('express');
var logger         = require('./helpers/logger')(module);
var path           = require('path');
var http           = require('http');
var env            = process.env || 'development';

// for chat clients
global.clients = {};

require('./config/' + env.NODE_ENV);

// Define connection with db
mongoose.connect(
    env.DB_PLATFORM +
    env.DB_USER + ':' +
    env.DB_PASS +
    env.DB_HOST + ':' +
    env.DB_PORT + '/' +
    env.DB_NAME);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'mongodb connection error:'));

db.once('connected', function callback() {
    var server;
    var port;
    var app;
    var io;
    // define app and socket.io
    app = express();
    // view engine setup
    app.engine('html', consolidate.underscore);
    app.set('view engine', 'html');

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());

    app.use(expressSession({
        name             : env.NAME,
        key              : env.KEY,
        secret           : env.SECRET,
        cookie: {
            path         : '/',
            httpOnly     : true,
            maxAge       : null
        },
        resave           : false,
        saveUninitialized: false,
        store            : new SessionStore({mongooseConnection: db})
    }));

    // Define all routers
    require('./routes/index')(app);

    port = env.PORT || 3000;

    server = http.createServer(app).listen(port);
    server.on('listening', function() {
        logger.info('Server is started on port: ' + port);
    });
    server.on('error', function(err) {
        logger.error(err);
    });

    io = socketio.listen(server);

    io.on('connection', function (socket) {
        logger.info('New customer connected (id=' + socket.id + ')');

        socket.on('start', function (userId) {
            if (!global.clients[userId]) {

                global.clients[userId] = socket;
                socket._id = userId;
            }
        });

        socket.on('message', function (text) {
            socket.emit('message', text);
        });

        socket.on('disconnect', function () {
            logger.info('Client has left website (id=' + socket._id + ')');

            global.clients[socket._id] = undefined;
        });
    });

    // catch 404 and forwarding to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // development error handler (will print stacktrace)
    if (env.NODE_ENV === 'development') {
        app.use(function (err, req, res, next) {
            res.status(200).send({fail: err.message});
        });
    }

    // production error handler (no scapegraces leaked to profile)
    app.use(function (err, req, res, next) {
        res.status(200).send({fail: err.message});
    });
});

