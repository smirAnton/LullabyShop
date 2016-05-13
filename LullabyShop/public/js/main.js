'use strict';

var APP = APP || {};

require.config({
    paths: {
        underscore       : './libs/underscore/underscore',
        bootstrap        : './libs/bootstrap/dist/js/bootstrap.min',
        jquery_ui        : './libs/jquery-ui/jquery-ui',
        socketio         : '../socket.io/socket.io',
        backbone         : './libs/backbone/backbone',
        jquery           : './libs/jquery/dist/jquery',
        moment           : './libs/moment/moment',
        text             : './libs/text/text',

        constants        : './constants/magicNumbers',
        validator        : './helpers/validator',
        dater            : './helpers/dater',

        collections      : './collections',
        templates        : '../templates',
        models           : './models',
        views            : './views'
    },
    shim: {
        bootstrap        : [ 'jquery', 'jquery_ui'],
        backbone         : ['underscore', 'jquery', 'jquery_ui'],
        app              : ['backbone'],

        underscore: {
            exports      : '_'
        },

        'socketio': {
            exports      : 'io'
        }
    }
});

require(['app'], function (app) {
    app.initialize();
});