'use strict';

define([
    'router',
    'toastr',
    'backbone',
    'underscore',
    'socketio'
], function (Router, toastr, Backbone, _, socket) {

    function init() {
        var router;

        $.ajax({
            url    : '/session',
            type   :'GET',
            success: function(session){
                APP.session          = {};
                APP.loggedIn         = session.loggedIn  || false;
                APP.session.username = session.firstname || 'Anonymous';
                APP.session.isAdmin  = session.isAdmin   || false;
                APP.session.userId   = session.userId    || null;
                APP.session.basket   = session.basket    || [];

                APP.channel = _.extend({}, Backbone.Events);

                router = new Router({channel : APP.channel});
                APP.router = router || {};

                Backbone.history.start();

                socket.connect();
            },
            error  : function(err){
                APP.handleError(err);
            }
        });
    }

    APP.handleError = function(err) {
        switch (err.status) {
            case 401: // Unauthorized
                APP.showErrorAlert(err.responseJSON.fail);
                //APP.navigate('#lullaby/shop');
                break;

            case 402: // Not registered
                APP.showErrorAlert(err.responseJSON.fail);
                APP.navigate('#lullaby/register');
                break;

            case 403: // Forbidden
                APP.showErrorAlert(err.responseJSON.fail);
                APP.navigate('#lullaby/shop');
                break;

            case 406: // Not activated
                APP.showErrorAlert(err.responseJSON.fail);
                APP.navigate('#lullaby/activate/choice');
                break;

            default:
                APP.showErrorAlert(err.responseJSON.fail);
                break;
        }
    };

    APP.navigate = function(url) {
        Backbone.history.navigate(url, {trigger: true});
    };

    APP.showSuccessAlert = function(message) {
        setupAlerts('success', message);
    };

    APP.showErrorAlert = function(message) {
        setupAlerts('error', message);
    };

    function setupAlerts (kind, message) {
        toastr.options = {
            'closeButton'      : false,
            'debug'            : true,
            'newestOnTop'      : false,
            'progressBar'      : false,
            'positionClass'    : 'toast-top-left',
            'preventDuplicates': false,
            'onclick'          : null,
            'showDuration'     : '300',
            'hideDuration'     : '1000',
            'timeOut'          : '5000',
            'extendedTimeOut'  : '1000',
            'showEasing'       : 'swing',
            'hideEasing'       : 'linear',
            'showMethod'       : 'fadeIn',
            'hideMethod'       : 'fadeOut'
        };

        toastr[kind](message);
    }

    return {
        initialize: init
    }
});