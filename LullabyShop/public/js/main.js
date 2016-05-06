'use strict';

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
        constants        : './constants/magicNumbers',
        validator        : './helpers/validator'
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