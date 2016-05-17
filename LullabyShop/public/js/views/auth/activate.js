'use strict';

define(['backbone'], function (Backbone) {

    return Backbone.View.extend({
        initialize: function (secret) {
            $.ajax({
                url    : '/activate/mail/' + secret,
                type   : 'GET',
                success: function (response) {
                    APP.showSuccessAlert(response.success);
                    APP.navigate('#lullaby/shop');
                },
                error  : function (err) {
                    APP.handleError(err);
                }
            });
        }
    });
});