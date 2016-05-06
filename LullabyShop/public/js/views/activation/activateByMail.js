'use strict';

define([
    'backbone'
], function (Backbone) {
    var View = Backbone.View.extend({

        initialize: function (secret) {
            var self = this;

            $.ajax({
                url    : '/activate/mail/' + secret,
                type   : 'GET',
                success: function (response) {
                    alert(response.success);
                    Backbone.history.navigate('#lullaby/login', {trigger: true});
                },
                error: function (xhr) {
                   self.handleError(xhr);
                }
            });
        },

        handleError: function(xhr) {
            switch (xhr.status) {
                case 400: // if wrong link (user use custom link for instance)
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/shop', {trigger: true});
                    break;

                case 404: // if account has already activated
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/shop', {trigger: true});
                    break;

                default:
                    break;
            }
        }
    });

    return View;
});