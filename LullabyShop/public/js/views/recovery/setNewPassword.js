'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/recovery/setNewPassword.html'
], function (Backbone, _, setNewPasswordTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(setNewPasswordTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #setNewPasswordBtn': 'onSetNewPassword',
            'click #cancelBtn'        : 'onCancel'
        },

        onSetNewPassword: function (e) {
            var $confirmedPassword = this.$el.find('#confirmedPassword');
            var $password          = this.$el.find('#password');
            var confirmedPassword;
            var password;

            e.stopPropagation();
            e.preventDefault();

            confirmedPassword = $confirmedPassword.val();
            password          = $password.val();

            if (!password || !confirmedPassword) {

                return APP.notification('Please, provide two passwords');
            }

            if (password !== confirmedPassword) {
                $confirmedPassword.val('');
                $password.val('');

                return APP.notification('Password not matched');
            }

            $.ajax({
                url    : '/recovery/password',
                type   :'POST',
                data   : {password: password},
                success: function(response){
                    APP.notification(response.success);
                    APP.navigate('#lullaby/login');
                },
                error  : function(err){
                    APP.handleError(err);
                }
            });
        },

        onCancel: function(e) {
            e.preventDefault();

            APP.navigate('#lullaby/shop');
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});