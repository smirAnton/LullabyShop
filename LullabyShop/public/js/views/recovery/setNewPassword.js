'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/recovery/setNewPassword.html'
], function (Backbone, _, UserModel, setNewPasswordTemplate) {
    var View = Backbone.View.extend({
        el: "#content",
        template: _.template(setNewPasswordTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #setNewPasswordBtn': 'onSetNewPassword'
        },

        onSetNewPassword: function (e) {
            var confirmedPassword;
            var userEmail;
            var password;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userEmail = localStorage.getItem('userEmail');

            if (!userEmail) {
                return alert('Nope...you should registered first');
            }

            confirmedPassword = this.$el.find('#confirmedPassword').val();
            password          = this.$el.find('#password').val();

            if (!password || !confirmedPassword) {

                return alert('Please fill all form\'s fields');
            }

            if (password !== confirmedPassword) {

                return alert('Password not matched');
            }

            user = new UserModel({
                password: password,
                email   : userEmail
            });

            user.urlRoot = '/recovery/password';

            user.save(null, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('You have been successfully set new password');
                        Backbone.history.navigate('lullaby/login', {trigger: true});
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