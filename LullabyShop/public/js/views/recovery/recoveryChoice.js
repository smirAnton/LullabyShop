'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/recovery/recoveryChoice.html'
], function (Backbone, _, UserModel, recoveryChoiceTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(recoveryChoiceTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #recoveryByMobile': 'recoveryByMobile',
            'click #recoveryByMail'  : 'recoveryByMail'
        },

        recoveryByMobile: function (e) {
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

            user.urlRoot = '/recovery/mobile';

            user.save(null, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('Please check your mobile');
                        Backbone.history.navigate('lullaby/recovery/mobile', {trigger: true});
                    }
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        recoveryByMail: function (e) {
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

            user.urlRoot = '/recovery/mail';

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
                    alert('Some error');
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