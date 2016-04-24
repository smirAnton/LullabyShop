'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/registration/registration.html'
], function (Backbone, _, UserModel, registrationTemplate) {
    var View = Backbone.View.extend({
        el: "#content",
        template: _.template(registrationTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #cancelBtn': 'onCancel',
            'click #signUpBtn': 'onSignUp'
        },

        onCancel: function(e) {
            e.stopPropagation();
            e.preventDefault();

            Backbone.history.navigate('lullaby/shop', {trigger: true});
        },

        onSignUp: function (e) {
            var confirmedPassword;
            var firstname;
            var password;
            var surname;
            var gender;
            var phone;
            var email;
            var user;

            e.stopPropagation();
            e.preventDefault();

            confirmedPassword = this.$el.find('#confirmedPassword').val();
            firstname         = this.$el.find('#firstname').val();
            password          = this.$el.find('#password').val();
            surname           = this.$el.find('#surname').val();
            gender            = this.$el.find('#gender').val();
            email             = this.$el.find('#email').val();
            phone             = this.$el.find('#phone').val();

            if (!confirmedPassword || !firstname || !password || !gender || !email || !phone) {
                return alert('Please, fill all form\'s fields');
            }

            if (password !== confirmedPassword) {
                return alert('Passwords not matched. Please try again')
            }

            user = new UserModel({
                confirmedPassword: confirmedPassword,
                firstname        : firstname,
                password         : password,
                surname          : surname,
                gender           : gender,
                email            : email,
                phone            : phone
            });

            user.urlRoot = '/registration';

            user.save(null, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {
                        // save profile's email in local storage and global variable for further providing token's secret
                        APP.userEmail = email;
                        localStorage.setItem('userEmail', email);

                        alert('You have successfully registered. Please activate your account');
                        Backbone.history.navigate('lullaby/activate/choice', {trigger: true});
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