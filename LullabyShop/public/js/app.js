'use strict';

define(['backbone', 'underscore', 'router', 'socketio'], function (Backbone, _, Router, socket) {

    function init() {
        var router;

        APP.channel = _.extend({}, Backbone.Events);

        router = new Router({channel : APP.channel});
        APP.router = router || {};

        Backbone.history.start();

        socket.connect();

        $.ajax({
            url : '/session',
            type:'GET',
            success: function(sessionData, xhr){
                console.log(sessionData);
                localStorage.clear();

                if (sessionData.loggedIn) {
                    localStorage.setItem('loggedIn', true);
                    localStorage.setItem('userId',   sessionData.userId);
                }

                if (sessionData.isAdmin) {
                    localStorage.setItem('isAdmin', true);
                }

                APP.userFirstname = sessionData.userName || 'Anonymous';
                localStorage.setItem('userFirstname', APP.userFirstname);

                if (sessionData.basket) {
                    localStorage.setItem('basket', JSON.stringify(sessionData.basket));
                    console.log(localStorage.getItem('basket'));
                } else {
                    localStorage.setItem('basket', JSON.stringify([]));
                }
            },
            error: function(err, xhr){
                alert(xhr.statusText);
            }
        });
    }

    return {
        initialize: init
    }
});