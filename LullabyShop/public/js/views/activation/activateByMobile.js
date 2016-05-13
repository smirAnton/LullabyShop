'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/activation/activateByMobile.html'
], function (Backbone, _, activationTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(activationTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #activateBtn': 'onActivate'
        },

        onActivate : function(e) {
            var secret;

            e.stopPropagation();
            e.preventDefault();

            secret = this.$el.find('#secret').val();
            if (!secret) {

                return alert('Please provide secret number');
            }

            $.ajax({
                url    : '/activate/mobile',
                type   : 'POST',
                data   : {secret: secret},
                success: function (response) {
                    APP.notification(response.success);
                    APP.navigate('#lullaby/login');
                },
                error  : function (err) {
                    APP.handleError(err)
                }
            });
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});