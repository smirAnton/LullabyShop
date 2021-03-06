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
                APP.session.totalSum = session.totalSum  || 0;
                APP.session.username = session.firstname || 'Anonymous';
                APP.session.isAdmin  = session.isAdmin   || false;
                APP.session.basket   = session.basket    || [];
                APP.session.userId   = session.userId    || null;
                APP.loggedIn         = session.loggedIn  || false;

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
            case 401:
                APP.showErrorAlert(err.responseJSON.fail);
                APP.navigate('#lullaby/shop');
                break;

            case 402: // Registration not activated
                $('#loginBox').slideUp(300, function() {
                    $('#activationChoiceBox').slideDown(300, function() {
                        APP.showErrorAlert(err.responseJSON.fail);
                    });
                });
                break;

            case 404: // Not exist such page
                APP.showErrorAlert(err.responseJSON.fail);
                break;

            default:
                // APP.showWarningAlert(err);
                console.log(err);
                break;
        }
    };

    APP.navigate = function(url) {
        Backbone.history.navigate(url, {trigger: true});
    };

    APP.blogsPaginNavigate = function(pageNumber) {
        Backbone.history.navigate('#lullaby/blog/p=' + pageNumber);
    };

    APP.productsPaginNavigate = function(pageNumber) {
        Backbone.history.navigate('#lullaby/product/p=' + pageNumber);
    };

    APP.showSuccessAlert = function(message) {
        setupAlerts('success', message);
    };

    APP.showErrorAlert = function(message) {
        setupAlerts('error', message);
    };

    APP.showWarningAlert = function(message) {
        setupAlerts('warning', message);
    };

    function setupAlerts (kind, message) {
        toastr.options = {
            'closeButton'      : true,
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