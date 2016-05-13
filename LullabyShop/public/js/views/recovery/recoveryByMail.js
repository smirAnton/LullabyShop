'use strict';

define(['backbone'], function (Backbone) {

    return Backbone.View.extend({
        initialize: function (secret) {
            $.ajax({
                url    : '/recovery/mail/' + secret,
                type   : 'GET',
                success: function (response) {
                    APP.notification(response.success);
                    APP.navigate('#lullaby/recovery/password');
                },
                error  : function (err) {
                    APP.handleError(err);
                }
            });
        }
    });
});