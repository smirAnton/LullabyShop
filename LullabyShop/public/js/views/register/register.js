'use strict';

define([
    'backbone',
    'validator',
    'underscore',
    'text!templates/register/register.html'
], function (Backbone, validator, _, registerTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(registerTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #createAccountBtn': 'onCreateAccount',
            'click #cancelBtn'       : 'onCancel'
        },

        onCreateAccount: function (e) {
            var $confirmedPassword = this.$el.find('#confirmedPassword');
            var confirmedPassword;
            var firstname;
            var userData;
            var password;
            var surname;
            var gender;
            var phone;
            var email;
            var fail;

            e.stopPropagation();
            e.preventDefault();

            confirmedPassword = $confirmedPassword.val();
            firstname         = this.$el.find('#firstname').val();
            password          = this.$el.find('#password').val();
            surname           = this.$el.find('#surname').val();
            email             = this.$el.find('#email').val();
            phone             = this.$el.find('#phone').val();
            gender            = this.$el.find('[name=gender]:checked').val();

            if (fail = validator.isPassword(confirmedPassword)                   ||
                       validator.isPassword(password)                            ||
                       validator.isMobile(phone)                                 ||
                       validator.isEmail(email)                                  ||
                       validator.isMatchedPasswords(password, confirmedPassword)) {

                return APP.showErrorAlert(fail);
            }

            userData = {
                confirmedPassword: confirmedPassword,
                firstname        : firstname,
                password         : password,
                surname          : surname,
                gender           : gender,
                email            : email,
                phone            : phone
            };

            $.ajax({
                method : 'POST',
                url    : '/register',
                data   : userData,
                success: function (response) {
                    APP.showSuccessAlert(response.success);
                    APP.navigate('#lullaby/shop');
                    APP.activate = true;
                },
                error  : function (err) {
                    APP.handleError(err);
                }
            });
        },

        onCancel: function (e) {
            e.preventDefault();

            APP.navigate('lullaby/shop');
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});