'use strict';

define(['backbone', 'underscore', 'router', 'socketio'], function (Backbone, _, Router, socket) {

    function init() {
        var router;

        APP.channel = _.extend({}, Backbone.Events);

        router = new Router({channel : APP.channel});
        APP.router = router || {};

        Backbone.history.start();

        socket.connect();

        APP.notification = function(notificationText) {
            $('#notification').empty().append('<p>' + notificationText + '</p>').dialog();
        };

        APP.navigate = function(url) {
            Backbone.history.navigate(url, {trigger: true});
        };

        APP.handleError = function(err) {
            switch (err.status) {
                case 401: // Unauthorized
                    APP.notification(err.responseJSON.fail);
                    APP.navigate('#lullaby/login');
                    break;

                case 402: // Not registered
                    APP.notification(err.responseJSON.fail);
                    APP.navigate('#lullaby/register');
                    break;

                case 403: // Forbidden
                    APP.notification(err.responseJSON.fail);
                    APP.navigate('#lullaby/shop');
                    break;

                case 406: // Not activated
                    APP.notification(err.responseJSON.fail);
                    APP.navigate('#lullaby/activate/choice');
                    break;

                default:
                    APP.notification(err.responseJSON.fail);
                    break;
            }
        };

        $.ajax({
            url    : '/session',
            type   :'GET',
            success: function(session){
                APP.session  = {};
                APP.loggedIn = session.loggedIn || false;

                APP.session.username = session.username || 'Anonymous';
                APP.session.isAdmin  = session.isAdmin  || false;
                APP.session.userId   = session.userId   || null;
                APP.session.basket   = session.basket   || [];
            },
            error  : function(err){
                APP.handleError(err);
            }
        });
    }

    return {
        initialize: init
    }
});