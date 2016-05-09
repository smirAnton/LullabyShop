'use strict';

define([
    'backbone',
    'validator',
    'underscore',
    'text!templates/login/login.html'
], function (Backbone, validator, _, loginTemplate) {
    var View = Backbone.View.extend({
        el      : '#content',
        template: _.template(loginTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #loginBtn': 'onLogin',
            'click #cancelBtn': 'onCancel'
        },

        onLogin: function (e) {
            var self = this;
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

            if (!validator.validateEmail(email)) {

                return alert('Please, provide email');
            }

            userData = {
                rememberMe: rememberMe,
                password  : password,
                email     : email
            };

            $.ajax({
                url    : '/login',
                method : 'POST',
                data   : userData,
                success: function (response) {
                    var userFirstname;
                    var isAdmin;
                    var userId;

                    userFirstname = response.firstname;
                    isAdmin       = response.isAdmin;
                    userId        = response._id;

                    if (response.isAdmin) {
                        localStorage.setItem('isAdmin', isAdmin);
                    }

                    localStorage.setItem('userFirstname', userFirstname);
                    localStorage.setItem('loggedIn',      'true');
                    localStorage.setItem('userId',        userId);

                    alert('Welcome to Lullaby\'s store');
                    Backbone.history.navigate('lullaby/shop', {trigger: true});
                },
                error : function (xhr) {
                    self.handleError(xhr);
                }
            });
        },

        onCancel: function (e) {
            e.stopPropagation();
            e.preventDefault();

            Backbone.history.navigate('lullaby/shop', {trigger: true});
        },

        handleError: function(xhr) {
            switch (xhr.status) {
                case 400: // wrong password
                    alert(xhr.responseJSON.fail);
                    self.$el.find('#password').val('');
                    break;

                case 401: // account is not activated
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/activate/choice', {trigger: true});
                    break;

                case 403: // user is banned
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/shop', {trigger: true});
                    break;

                case 404: // account is not registered
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/register', {trigger: true});
                    break;

                case 422: // user not fill all form's fields
                    alert(xhr.responseJSON.fail);
                    break;

                default:
                    break;
            }
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});