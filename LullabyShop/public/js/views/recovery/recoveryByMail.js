'use strict';

define([
    'backbone'
], function (Backbone) {
    var View = Backbone.View.extend({

        initialize: function (secret) {
            var self = this;

            $.ajax({
                url    : '/recovery/mail/' + secret,
                method : 'GET',
                success: function (response) {
                    alert(response.success);
                    Backbone.history.navigate('#lullaby/recovery/password', {trigger: true});
                },
                error  : function (xhr) {
                    self.handleError(xhr);
                }
            });
        },

        handleError: function(xhr) {
            switch (xhr.status) {
                case 400: // Wrong secret link
                    alert(xhr.responseJSON.fail);
                    break;

                case 403: // No secret number
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('$lullaby/shop', {trigger: true});
                    break;

                default:
                    break;
            }
        }
    });

    return View;
});