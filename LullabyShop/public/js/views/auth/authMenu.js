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
            var self = this;

            this.render();

            if (APP.loggedIn) {
                self.$el.find('#auth_menu').slideUp(0, function() {
                    self.$el.find('#auth_menu_logout').slideDown(0);
                });

                return;
            }

            if (APP.recovery) {
                self.$el.find('#setNewPasswordBox').slideDown(300, function() {
                    APP.recovery = false;
                });

                return;
            }

            if (APP.activate) {
                self.$el.find('#activationChoiceBox').slideDown(300, function() {
                    APP.activate = false;
                });
            }
        },

        events: {
            'click #loginBtn'                  : 'onLogin',
            'click #logoutBtn'                 : 'onLogout',
            'click #signInBtn'                 : 'onSignIn',
            'click #recoveryBtn'               : 'onRecovery',
            'click #setNewPassBtn'             : 'onSetNewPassword',
            'click #forgetPassLink'            : 'onForgetPassLink',
            'click #activateByEmailBtn'        : 'onActivateByEmail',
            'click #activateByPhoneBtn'        : 'onActivateByPhone',
            'click #recoveryByPhoneBtn'        : 'onRecoveryByPhone',
            'click #recoveryByEmailBtn'        : 'onRecoveryByEmail',
            'click #checkRecoverySmsSecretBtn' : 'onCheckRecoverySmsSecret',
            'click #checkActivateSmsSecretBtn' : 'onCheckActivateSmsSecret'
        },

        onLogin: function(e) {
            var self = this;

            e.preventDefault();

            self.$el.find('#checkActivationSmsBox').slideUp(600, function() {
                self.$el.find('#activationChoiceBox').slideUp(600, function() {
                    self.$el.find('#forgetPassBox').slideUp(600, function() {
                        self.$el.find('#recoveryChoiceBox').slideUp(600, function() {
                            self.$el.find('#checkSmsBox').slideUp(600, function() {
                                self.$el.find('#setNewPasswordBox').slideUp(600, function() {
                                    self.$el.find('#loginBox').slideToggle(600);
                                });
                            });
                        });
                    });
                });
            });
        },

        onLogout:  function(e) {
            var self = this;

            e.preventDefault();

            $.ajax({
                type   :'GET',
                url    : '/logout',
                success: function(response){
                    APP.loggedIn = false;
                    APP.session  = {};

                    self.$el.find('#auth_menu_logout').slideUp(0, function(){
                        self.$el.find('#auth_menu').slideDown(0, function() {
                            $('#account').slideUp(300, function() {
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
            var self = this;
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
                    self.$el.find('#loginBox').slideUp(300, function() {
                        self.$el.find('#auth_menu').slideUp(300, function() {
                            self.$el.find('#auth_menu_logout').slideDown(300, function() {
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

        onRecovery: function(e) {
            var self = this;
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
                success: function () {
                    self.$el.find('#forgetPassBox').slideUp(600, function() {
                        self.$el.find('#recoveryChoiceBox').slideDown(600, function() {
                            APP.session.email = email;
                        });
                    });
                },
                error  : function (err) {
                    APP.handleError(err);
                }
            });
        },

        onSetNewPassword: function(e) {
            var self               = this;
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
                    self.$el.find('#setNewPasswordBox').slideUp(600, function() {
                        self.$el.find('#loginBox').slideDown(600, function() {
                            APP.showSuccessAlert(response.success);
                        });
                    });
                },
                error  : function(err){
                    APP.handleError(err);
                }
            });
        },

        onForgetPassLink: function(e) {
            var self = this;

            e.preventDefault();

            self.$el.find('#loginBox').slideUp(600, function() {
                self.$el.find('#forgetPassBox').slideDown(600);
            });
        },

        onActivateByEmail: function(e) {
            var self = this;
            e.preventDefault();

            $.ajax({
                type   :'GET',
                url    : '/activate/mail',
                success: function(response){
                    self.$el.find('#activationChoiceBox').slideUp(300, function() {
                        APP.showSuccessAlert(response.success);
                    })
                },
                error  : function(err){
                    APP.handleError(err);
                }
            });
        },

        onActivateByPhone: function(e) {
            var self = this;

            e.preventDefault();

            $.ajax({
                type   :'GET',
                url    : '/activate/mobile',
                success: function(response){
                    self.$el.find('#activationChoiceBox').slideUp(300, function() {
                        self.$el.find('#checkActivationSmsBox').slideDown(300, function() {
                            APP.showSuccessAlert(response.success);
                        });
                    });
                },
                error  : function(err){
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

        onCheckRecoverySmsSecret: function(e) {
            var self = this;
            var secret;
            var fail;

            e.stopPropagation();
            e.preventDefault();

            secret = this.$el.find('#secretRecoveryNumber').val();
            //validate secret number
            if (fail = validator.isPhoneSecret(secret)) {

                return APP.showErrorAlert(fail);
            }

            $.ajax({
                type   : 'POST',
                url    : '/recovery/mobile',
                data   : {secret: secret},
                success: function () {
                    self.$el.find('#checkSmsBox').slideUp(600, function() {
                        self.$el.find('#setNewPasswordBox').slideDown(600);
                    });
                },
                error  : function (err) {
                    APP.handleError(err);
                }
            });
        },

        onCheckActivateSmsSecret: function(e) {
            var self = this;
            var secret;
            var fail;

            e.stopPropagation();
            e.preventDefault();

            secret = this.$el.find('#secretActivateNumber').val();
            //validate secret number
            if (fail = validator.isPhoneSecret(secret)) {

                return APP.showErrorAlert(fail);
            }

            $.ajax({
                type   : 'POST',
                url    : '/activate/mobile',
                data   : {secret: secret},
                success: function (response) {
                    self.$el.find('#checkActivationSmsBox').slideUp(600, function() {
                        self.$el.find('#loginBox').slideDown(600, function() {
                            APP.showSuccessAlert(response.success);
                        });
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


