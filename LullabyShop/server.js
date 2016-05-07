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
var db;

// for chat clients
global.clients = {};

require('./config/' + env.NODE_ENV);

// Define connection with db
mongoose.connect(env.DB_HOST, env.DB_NAME, env.DB_PORT, {
    user: env.DB_USER,
    pass: env.DB_PASS
});

db = mongoose.connection;

db.on('error', console.error.bind(console, 'mongodb connection error:'));

db.once('connected', function callback() {
    var server;
    var port;
    var app;
    var io;

    app = express();

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

    require('./routes/index')(app);

    port = parseInt(env.PORT) || 3000;

    server = http.createServer(app).listen(port);

    io = socketio.listen(server);
    io.on('connection', function (socket) {
        logger.info('New customer connected (id=' + socket.id + ')');

        socket.on('start', function (userId) {
            if (!global.clients[userId]) {

                global.clients[userId] = socket;
                socket._id = userId;
            }
        });

        socket.on('message', function (data, callback) {
            socket.broadcast.emit('message', {message: data.message});

            return callback({message: data.message, label: true});
        });

        socket.on('disconnect', function () {
            logger.info('Customer disconnected (id=' + socket._id + ')');

            global.clients[socket._id] = undefined;
        });
    });

    server.on('listening', function() {
        logger.info('Listening on http://localhost:' + port + '/');
    });

    server.on('error', function(err) {
        logger.error(err);
        process.exit(1);
    });
});

