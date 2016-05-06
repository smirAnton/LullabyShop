'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/recovery/useRecovery.html'
], function (Backbone, _, recoveryFormTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(recoveryFormTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #provideEmailBtn': 'onProvideEmail'
        },

        onProvideEmail: function (e) {
            var self = this;
            var userEmail;

            e.stopPropagation();
            e.preventDefault();

            userEmail = this.$el.find('#email').val();

            if (!userEmail || !userEmail.trim().length) {

                return alert('Please provide email');
            }

            $.ajax({
                url    : '/recovery',
                type   : 'POST',
                data   : {email: userEmail},
                success: function (response) {
                    Backbone.history.navigate('lullaby/recovery/choice', {trigger: true});
                },
                error  : function (xhr) {
                    self.handleError(xhr);
                }
            });
        },

        handleError: function(xhr) {
            switch (xhr.status) {
                case 404: // email is not registered
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/register', {trigger: true});
                    break;

                case 422: // email is not provided
                    alert(xhr.responseJSON.fail);
                    self.$el.find('#email').val('');
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