'use strict';

define(['backbone'], function (Backbone) {

    return Backbone.View.extend({
        initialize: function (secret) {

            $.ajax({
                type   : 'GET',
                url    : '/recovery/mail/' + secret,
                success: function (response) {
                    APP.notification(response.success);
                    APP.navigate('#lullaby/shop');
                    APP.recovery = true;
                },
                error  : function (err) {
                    APP.handleError(err);
                }
            });
        }
    });
});