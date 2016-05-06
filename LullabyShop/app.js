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
    var app;

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

    return app;
});

