'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/login/login.html'
], function (Backbone, _, UserModel, loginTemplate) {
    var View = Backbone.View.extend({
        el      : '#content',
        template: _.template(loginTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #signInBtn': 'onSignIn',
            'click #cancelBtn': 'onCancel'
        },

        onSignIn: function (e) {
            var rememberMe;
            var password;
            var email;
            var user;

            e.stopPropagation();
            e.preventDefault();

            rememberMe =$("#rememberMe").is(":checked");
            password   = this.$el.find('#password').val();
            email      = this.$el.find('#email').val();

            if (!password || !email) {
                return alert('Please, fill all form\'s fields');
            }

            user = new UserModel({
                rememberMe: rememberMe,
                password  : password,
                email     : email
            });

            user.urlRoot = '/login';

            user.save(null, {
                success: function (response, xhr) {
                    var userFirstname;
                    var userEmail;
                    var isAdmin;
                    var userId;
                    var fail;

                    if (response.attributes.fail) {
                        fail = response.attributes.fail;

                        if (fail === 'Account is not registered. Please, sign up') {
                            alert(fail);
                            Backbone.history.navigate('#lullaby/register', {trigger: true});
                        } else if (fail === 'Account not activated yet. Please, activate it') {
                            alert(fail);

                            APP.userEmail = email;
                            localStorage.setItem('userEmail', email);

                            Backbone.history.navigate('#lullaby/activate/choice', {trigger: true});
                        } else {
                            alert(fail);
                        }
                    } else {
                        userFirstname = response.attributes.firstname;
                        userEmail     = response.attributes.email;
                        userId        = response.attributes._id;
                        isAdmin       = response.attributes.isAdmin;

                        APP.authorised = true;
                        localStorage.setItem('loggedIn', 'true');

                        if (response.attributes.isAdmin) {

                            APP.isAdmin = isAdmin;
                            localStorage.setItem('isAdmin', isAdmin);
                        }

                        APP.userId = userId;
                        localStorage.setItem('userId', userId);

                        APP.userEmail = userEmail;
                        localStorage.setItem('userEmail', userEmail);

                        APP.userFirstname = userFirstname;
                        localStorage.setItem('userFirstname', userFirstname);

                        alert('Welcome to Lullaby\'s store');
                        Backbone.history.navigate('lullaby/shop', {trigger: true});
                    }
                },
                error  : function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        onCancel: function(e) {
            e.stopPropagation();
            e.preventDefault();

            Backbone.history.navigate('lullaby/shop', {trigger: true});
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});