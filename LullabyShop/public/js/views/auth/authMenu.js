'use strict';

define([
    'backbone',
    'validator',
    'underscore',
    'text!templates/auth/authMenu.html'
], function (Backbone, validator, _, authMenuTemplate) {

    return Backbone.View.extend({
        el      : "#authMenu",
        template: _.template(authMenuTemplate),

        initialize: function () {
            this.render();

            if (APP.loggedIn) {
                $('#auth_menu').slideUp(0, function() {
                    $('#auth_menu_logout').slideDown(0);
                });
            }

            if (APP.recovery) {
                $('#setNewPasswordBox').slideDown(600, function() {
                    APP.recovery = false;
                });
            }
        },

        events: {
            'click #loginBtn'          : 'onLogin',
            'click #logoutBtn'         : 'onLogout',
            'click #signInBtn'         : 'onSignIn',
            'click #registerBtn'       : 'onRegister',
            'click #recoveryBtn'       : 'onRecovery',
            'click #setNewPassBtn'     : 'onSetNewPassword',
            'click #forgetPassLink'    : 'onForgetPassLink',
            'click #checkSmsSecretBtn' : 'onCheckSmsSecret',
            'click #recoveryByPhoneBtn': 'onRecoveryByPhone',
            'click #recoveryByEmailBtn': 'onRecoveryByEmail'
        },

        onLogin: function(e) {
            e.preventDefault();

            $('#forgetPassBox').slideUp(600, function() {
                $('#recoveryChoiceBox').slideUp(600, function() {
                    $('#checkSmsBox').slideUp(600, function() {
                        $('#setNewPasswordBox').slideUp(600, function() {
                            $('#loginBox').slideToggle(600);
                        });
                    });
                });
            });
        },

        onLogout:  function(e) {
            e.preventDefault();

            $.ajax({
                type   :'GET',
                url    : '/logout',
                success: function(response){
                    APP.loggedIn = false;
                    APP.session  = {};

                    $('#auth_menu_logout').slideUp(300, function(){
                        $('#auth_menu').slideDown(300, function() {
                            $('#account').slideUp(100, function() {
                                APP.showSuccessAlert(response.success);
                            });
                        });
                    });
                },
                error  : function(err){
                    APP.handleError(err);
                }
            });
        },

        onSignIn: function(e) {
            var rememberMe;
            var password;
            var userData;
            var email;
            var fail;

            e.preventDefault();

            rememberMe = this.$el.find("#checkbox").is(":checked");
            password   = this.$el.find('#password').val();
            email      = this.$el.find('#email').val();

            // validate user's data
            if (fail = validator.isEmail(email) || validator.isPassword(password)) {

                return APP.showErrorAlert(fail);
            }

            userData = {
                rememberMe: rememberMe,
                password  : password,
                email     : email
            };

            $.ajax({
                type   : 'POST',
                url    : '/login',
                data   : userData,
                success: function (user) {
                    $('#loginBox').slideUp(300, function() {
                        $('#auth_menu').slideUp(300, function() {
                            $('#auth_menu_logout').slideDown(300, function() {
                                $('#account').slideDown(200, function() {
                                    APP.loggedIn         = true;
                                    APP.session.username = user.firstname;
                                    APP.session.isAdmin  = user.isAdmin;
                                    APP.session.userId   = user._id;
                                    APP.session.email    = user.email;

                                    APP.showSuccessAlert('Welcome to Lullaby\'s store');
                                });
                            });
                        });
                    });
                },
                error : function (err) {
                    APP.handleError(err);
                }
            });
        },

        onRegister: function(e) {
            e.preventDefault();

            $('#registerBox').slideToggle(600);
        },

        onRecovery: function(e) {
            var email;
            var fail;

            e.preventDefault();

            email = this.$el.find('#userEmail').val();
            // validate user's data
            if (fail = validator.isEmail(email)) {

                return APP.showErrorAlert(fail);
            }

            $.ajax({
                type   : 'POST',
                url    : '/recovery',
                data   : {email: email},
                success: function (response) {
                    APP.session.email = email;
                    $('#forgetPassBox').slideUp(600, function() {
                        $('#recoveryChoiceBox').slideDown(600);
                    });
                },
                error  : function (err) {
                    APP.handleError(err);
                }
            });
        },

        onSetNewPassword: function(e) {
            var $password          = this.$el.find('#newPassword');
            var $confirmedPassword = this.$el.find('#confirmedNewPassword');
            var confirmedPassword;
            var password;
            var fail;

            e.stopPropagation();
            e.preventDefault();

            password          = $password.val();
            confirmedPassword = $confirmedPassword.val();
            //validate pass
            if (fail = validator.isPassword(password) || validator.isPassword(confirmedPassword)) {

                return APP.notification(fail);
            }

            if (password !== confirmedPassword) {
                $confirmedPassword.val('');

                return APP.notification('Passwords not matched');
            }

            $.ajax({
                type   :'POST',
                url    : '/recovery/password',
                data   : {password: password},
                success: function(response){
                    $('#setNewPasswordBox').slideUp(600, function() {
                        $('#loginBox').slideDown(600, function() {
                            APP.notification(response.success);
                        });
                    });
                },
                error  : function(err){
                    APP.handleError(err);
                }
            });
        },

        onForgetPassLink: function(e) {
            e.preventDefault();

            $('#loginBox').slideUp(600, function() {
                $('#forgetPassBox').slideDown(600);
            });
        },

        onCheckSmsSecret: function(e) {
            var secret;
            var fail;

            e.stopPropagation();
            e.preventDefault();

            secret = this.$el.find('#secretNumber').val();
            //validate secret number
            if (fail = validator.isPhoneSecret(secret)) {

                return APP.notification(fail);
            }

            $.ajax({
                type   : 'POST',
                url    : '/recovery/mobile',
                data   : {secret: secret},
                success: function (response) {
                    $('#checkSmsBox').slideUp(600, function() {
                        $('#setNewPasswordBox').slideDown(600);
                    });
                },
                error  : function (err) {
                    APP.handleError(err);
                }
            });
        },

        onRecoveryByPhone: function(e) {
            e.preventDefault();

            $.ajax({
                type   :'GET',
                url    : '/recovery/mobile',
                success: function(response){
                    $('#recoveryChoiceBox').slideUp(600, function() {
                        $('#checkSmsBox').slideDown(600, function() {
                            APP.showSuccessAlert(response.success);
                        });
                    });
                },
                error  : function(err){
                    APP.handleError(err);
                }
            });
        },

        onRecoveryByEmail: function(e) {
            e.preventDefault();

            $.ajax({
                type   : 'GET',
                url    : '/recovery/mail',
                data   : {email: APP.session.email},
                success: function (response) {
                    $('#recoveryChoiceBox').slideUp(600, function() {
                        APP.showSuccessAlert(response.success);
                    });
                },
                error  : function (err) {
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


