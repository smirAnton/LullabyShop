'use strict';

// define global variable for temporary data saving
var APP = APP || {};

require.config({
    paths: {
        backbone         : './libs/backbone/backbone',
        backbonePaginator: './libs/backbone.paginator/lib/backbone.paginator',
        jQuery           : './libs/jquery/dist/jquery',
        underscore       : './libs/underscore/underscore',
        bootstrap        : './libs/bootstrap/dist/js/bootstrap.min',
        socketio         : '../socket.io/socket.io',
        text             : './libs/text/text',
        models           : './models',
        collections      : './collections',
        views            : './views',
        templates        : '../templates',
        constants        : './constants/constants'
    },
    shim: {
        'socketio': {
            exports      : 'io'
        },
        underscore: {
            exports      : '_'
        },
        bootstrap        : ['jQuery'],
        backbone         : ['underscore', 'jQuery'],
        app              : ['backbone']
    }
});

require(['app'], function (app) {
    app.initialize();
});