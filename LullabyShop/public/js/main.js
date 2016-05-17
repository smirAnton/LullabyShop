'use strict';

var APP = APP || {};

require.config({
    paths: {
        underscore       : './libs/underscore/underscore',
        bootstrap        : './libs/bootstrap/dist/js/bootstrap.min',
        socketio         : '../socket.io/socket.io',
        backbone         : './libs/backbone/backbone',
        jquery_ui        : './libs/jquery_ui_custom/jquery-ui.min',
        jquery           : './libs/jquery/dist/jquery',
        toastr           : './libs/toastr/toastr.min',
        moment           : './libs/moment/moment',
        text             : './libs/text/text',

        validator        : './helpers/validator',
        constant         : './constants/constants',
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