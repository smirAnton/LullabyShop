'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/recovery/setNewPassword.html'
], function (Backbone, _, setNewPasswordTemplate) {
    var View = Backbone.View.extend({
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
            var self = this;
            var confirmedPassword;
            var password;

            e.stopPropagation();
            e.preventDefault();


            confirmedPassword = this.$el.find('#confirmedPassword').val();
            password          = this.$el.find('#password').val();

            if (!password || !confirmedPassword) {

                return alert('Please fill all form\'s fields');
            }

            if (password !== confirmedPassword) {
                self.$el.find('#confirmedPassword').val('');
                self.$el.find('#password').val('');

                return alert('Password not matched');
            }

            $.ajax({
                url    : '/recovery/password',
                type   :'POST',
                data   : {password: password},
                success: function(response){
                    alert(response.success);
                    Backbone.history.navigate('#lullaby/login', {trigger: true})
                },
                error  : function(xhr){
                    self.handleError(xhr);
                }
            });
        },

        onCancel: function(e) {
            e.stopPropagation();
            e.preventDefault();

            Backbone.history.navigate('#lullaby/shop', {trigger: true});
        },

        handleError: function(xhr) {
            var self = this;

            switch (xhr.status) {
                case 403: // No email
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/recovery', {trigger: true});
                    break;

                case 422: // not provided new password
                    alert(xhr.responseJSON.fail);
                    self.$el.find('#confirmedPassword').val('');
                    self.$el.find('#password').val('');
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