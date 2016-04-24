'use strict';

define([
    'backbone',
    'underscore',
    'models/user'
], function (Backbone, _, UserModel) {
    var View = Backbone.View.extend({

        initialize: function (secret) {
            var user = new UserModel({
                secret: secret
            });

            user.urlRoot = '/activate/mail/secret';

            user.save(null, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('You have successfully activated account');
                        Backbone.history.navigate('lullaby/login', {trigger: true});
                    }
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        }
    });

    return View;
});