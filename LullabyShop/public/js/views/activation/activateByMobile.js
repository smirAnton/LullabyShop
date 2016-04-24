'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/activation/activateByMobile.html'
], function (Backbone, _, UserModel, activationTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(activationTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #activate': 'activate'
        },

        activate : function(e) {
            var tokenSecret;
            var userEmail;
            var user;

            e.stopPropagation();
            e.preventDefault();

            tokenSecret = this.$el.find('#secret').val();

            userEmail = localStorage.getItem('userEmail');

            if (!userEmail) {
                return alert('Nope...you should registered first');
            }

            if (!tokenSecret) {
                return alert('Please provide secret number');
            }

            user = new UserModel({
                secret: tokenSecret,
                email : userEmail
            });

            user.urlRoot = '/activate/mobile/secret';

            user.save(null, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('You have been successfully activated account');
                        Backbone.history.navigate('lullaby/login', {trigger: true});
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