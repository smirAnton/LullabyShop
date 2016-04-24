'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/activation/activationChoice.html'
], function (Backbone, _, UserModel, activationTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(activationTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #activateByMobile': 'activateByMobile',
            'click #activateByMail': 'activateByMail'
        },

        activateByMobile: function (e) {
            var userEmail;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userEmail = localStorage.getItem('userEmail');

            if (!userEmail) {
                return alert('Nope...you should registered first');
            }

            user = new UserModel({
                email: userEmail
            });

            user.urlRoot = '/activate/mobile';

            user.save(null, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('Please check your mobile');
                        Backbone.history.navigate('lullaby/activate/mobile', {trigger: true});
                    }
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        activateByMail: function (e) {
            var userEmail;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userEmail = localStorage.getItem('userEmail');

            if (!userEmail) {
                return alert('Nope...you should registered first');
            }

            user = new UserModel({
                email: userEmail
            });

            user.urlRoot = '/activate/mail';

            user.save(null, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('Please check your email');
                        Backbone.history.navigate('lullaby/shop', {trigger: true});
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