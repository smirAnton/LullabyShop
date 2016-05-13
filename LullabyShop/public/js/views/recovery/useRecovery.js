'use strict';

define([
    'backbone',
    'validator',
    'underscore',
    'text!templates/recovery/useRecovery.html'
], function (Backbone, validator, _, recoveryFormTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(recoveryFormTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #provideEmailBtn': 'onProvideEmail'
        },

        onProvideEmail: function (e) {
            var email;

            e.stopPropagation();
            e.preventDefault();

            email = this.$el.find('#email').val();
            if (!validator.isEmail(email)) {

                return APP.notification('Please, provide email');
            }

            $.ajax({
                url    : '/recovery',
                type   : 'POST',
                data   : {email: email},
                success: function (response) {
                    APP.navigate('lullaby/recovery/choice');
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