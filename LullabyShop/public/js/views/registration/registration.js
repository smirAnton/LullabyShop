'use strict';

define([
    'backbone',
    'validator',
    'underscore',
    'text!templates/registration/registration.html'
], function (Backbone, validator, _, registrationTemplate) {
    var View = Backbone.View.extend({
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
            var self = this;
            var confirmedPassword;
            var firstname;
            var fields;
            var userData;
            var password;
            var surname;
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
            gender            = $('[name=gender]:checked').val();

            if (!confirmedPassword || !firstname || !password || !gender || !email || !phone) {

                return alert('Please, fill all form\'s fields');
            }

            if (password !== confirmedPassword) {

                return alert('Passwords not matched. Please try again')
            }

            if (!validator.validateEmail(email)) {

                return alert('Nope...Please, provide email');
            }

            if (!validator.validatePhone(phone)) {

                return alert('Nope...Please, provide phone number in format +38(XXX)XXX-XX-XX');
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
                    alert(response.success);
                    Backbone.history.navigate('lullaby/activate/choice', {trigger: true});
                },
                error  : function (xhr) {
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
                case 400: // passwords are not matched
                    alert(xhr.responseJSON.fail);
                    self.$el.find('#confirmedPassword').val('');
                    self.$el.find('#password').val('');
                    break;

                case 409: // email already registered
                    alert(xhr.responseJSON.fail);
                    self.$el.find('#email').val('');
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