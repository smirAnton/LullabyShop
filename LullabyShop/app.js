'use strict';

var expressSession = require('express-session');
var SessionStore   = require('connect-mongo/es5')(expressSession);
var cookieParser   = require('cookie-parser');
var consolidate    = require('consolidate');
var compression    = require('compression');
var bodyParser     = require('body-parser');
var express        = require('express');
var helmet         = require('helmet');
var path           = require('path');
var env            = process.env || 'development';

module.exports =  function(db) {
    var app = express();

    app.use(helmet());
    app.use(compression());

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
};

