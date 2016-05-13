'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/recovery/recoveryByMobile.html'
], function (Backbone, _, recoveryTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(recoveryTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #provideSecretBtn': 'onProvideSecret'
        },

        onProvideSecret : function(e) {
            var secret;

            e.stopPropagation();
            e.preventDefault();

            secret = this.$el.find('#secretNumber').val();

            if (!secret) {

                return alert('Please, provide secret number');
            }

            $.ajax({
                url    : '/recovery/mobile',
                type   : 'POST',
                data   : {secret: secret},
                success: function (response) {
                    APP.notification(response.success);
                    APP.navigate('#lullaby/recovery/password');
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