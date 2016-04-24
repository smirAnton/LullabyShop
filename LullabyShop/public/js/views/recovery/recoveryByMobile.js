'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/recovery/recoveryByMobile.html'
], function (Backbone, _, UserModel, recoveryTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(recoveryTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #recovery': 'recovery'
        },

        recovery : function(e) {
            var userEmail;
            var secret;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userEmail = localStorage.getItem('userEmail');

            if (!userEmail) {

                return alert('Nope...you should registered first');
            }

            secret = this.$el.find('#secret').val();

            if (!secret) {

                return alert('Please provide secret number');
            }

            user = new UserModel({
                secret: secret,
                email : userEmail
            });

            user.urlRoot = '/recovery/mobile/secret';

            user.save(null, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('Please set new password');
                        Backbone.history.navigate('lullaby/recovery/password', {trigger: true});
                    }
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});