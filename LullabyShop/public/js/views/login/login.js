'use strict';

define([
    'backbone',
    'validator',
    'underscore',
    'text!templates/login/login.html'
], function (Backbone, validator, _, loginTemplate) {

    return Backbone.View.extend({
        el      : '#content',
        template: _.template(loginTemplate),

        initialize: function () {
            APP.session = APP.session || {};

            this.render();
        },

        events: {
            'click #cancelBtn': 'onCancel',
            'click #loginBtn' : 'onLogin'
        },

        onCancel: function (e) {
            e.preventDefault();

            APP.navigate('lullaby/shop');
        },

        onLogin: function (e) {
            var rememberMe;
            var password;
            var userData;
            var email;

            e.stopPropagation();
            e.preventDefault();

            rememberMe = $("#rememberMe").is(":checked");
            password   = this.$el.find('#password').val();
            email      = this.$el.find('#email').val();

            if (!password || !email) {

                return alert('Please, fill all form\'s fields');
            }

            if (!validator.isEmail(email)) {

                return alert('Wrong email, please try again');
            }

            userData = {
                rememberMe: rememberMe,
                password  : password,
                email     : email
            };

            $.ajax({
                url    : '/login',
                type   : 'POST',
                data   : userData,
                success: function (user) {
                    APP.loggedIn         = true;
                    APP.session.username = user.firstname;
                    APP.session.isAdmin  = user.isAdmin;
                    APP.session.userId   = user._id;
                    APP.session.email    = user.email;

                    APP.notification('Welcome to Lullaby\'s store');
                    APP.navigate('lullaby/shop');
                },
                error : function (err) {
                    APP.handleError(err);
                }
            });
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});