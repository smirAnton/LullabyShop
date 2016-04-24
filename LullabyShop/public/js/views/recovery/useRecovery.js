'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/recovery/useRecovery.html'
], function (Backbone, _, UserModel, recoveryFormTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(recoveryFormTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #provideEmail': 'provideEmail'
        },

        provideEmail: function (e) {
            var userEmail;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userEmail = this.$el.find('#email').val();

            if (!userEmail) {

                return alert('Please provide email');
            }

            user = new UserModel({
                email: userEmail
            });

            user.urlRoot = '/recovery';

            user.save(null, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {
                        // save in local storage and global variable userEmail
                        APP.userEmail = userEmail;
                        localStorage.setItem('userEmail', userEmail);

                        Backbone.history.navigate('lullaby/recovery/choice', {trigger: true});
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