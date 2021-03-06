'use strict';

define(['backbone'], function (Backbone) {

    return Backbone.View.extend({
        initialize: function (secret) {
            $.ajax({
                type   : 'GET',
                url    : '/recovery/mail/' + secret,
                success: function (response) {
                    APP.recovery = true;
                    APP.navigate('#lullaby/shop');
                    APP.showSuccessAlert(response.success);
                },
                error  : function (err) {
                    APP.handleError(err);
                }
            });
        }
    });
});