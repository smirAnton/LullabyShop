'use strict';

define([
    'backbone',
    'validator',
    'underscore',
    'text!templates/registration/registration.html'
], function (Backbone, validator, _, registrationTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(registrationTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #registerBtn': 'onRegister',
            'click #cancelBtn'  : 'onCancel'
        },

        onRegister: function (e) {
            var confirmedPassword;
            var firstname;
            var userData;
            var password;
            var surname;
            var fields;
            var gender;
            var phone;
            var email;

            e.stopPropagation();
            e.preventDefault();

            confirmedPassword = this.$el.find('#confirmedPassword').val();
            firstname         = this.$el.find('#firstname').val();
            password          = this.$el.find('#password').val();
            surname           = this.$el.find('#surname').val();
            email             = this.$el.find('#email').val();
            phone             = this.$el.find('#phone').val();
            gender            = this.$el.find('[name=gender]:checked').val();

            if (!confirmedPassword || !firstname || !password || !gender || !email || !phone) {

                return alert('Please, fill all form\'s fields');
            }

            if (!validator.isEmail(email)) {

                return alert('Nope...Please, provide email');
            }

            if (!validator.isPhone(phone)) {

                return alert('Nope...Please, provide phone number in format +38(XXX)XXX-XX-XX');
            }

            if (password !== confirmedPassword) {

                return alert('Passwords not matched. Please try again')
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
                url    : '/register',
                method : 'POST',
                data   : userData,
                success: function (response) {
                    APP.notification(response.success);
                    APP.navigate('lullaby/activate/choice');
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