'use strict';

define(['backbone', 'underscore', 'router', 'socketio'], function (Backbone, _, Router, socket) {

    function init() {
        var router;

        APP.channel = _.extend({}, Backbone.Events);

        router = new Router({channel : APP.channel});
        APP.router = router || {};

        Backbone.history.start();

        socket.connect();

        // get session data
        $.ajax({
            url : '/session',
            type:'GET',
            success: function(sessionData){
                localStorage.clear();

                if (sessionData.loggedIn) {
                    APP.authorised = true;
                    APP.userId     = sessionData.userId;

                    localStorage.setItem('loggedIn', APP.authorised);
                    localStorage.setItem('userId',   APP.userId);
                }

                if (sessionData.isAdmin) {
                    APP.isAdmin    = true;
                    localStorage.setItem('isAdmin', APP.isAdmin);
                }

                APP.userFirstname = sessionData.userName || 'Anonymous';
                localStorage.setItem('userFirstname', APP.userFirstname);

                if (sessionData.basket) {
                    localStorage.setItem('basket', JSON.stringify(sessionData.basket));
                } else {
                    localStorage.setItem('basket', JSON.stringify([]));
                }
            },
            error: function(error){}
        });
    }

    return {
        initialize: init
    }
});