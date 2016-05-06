'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/recovery/recoveryByMobile.html'
], function (Backbone, _, recoveryTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(recoveryTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #provideSecretNumberBtn': 'onProvideSecretNumber'
        },

        onProvideSecretNumber : function(e) {
            var self = this;
            var secretNumber;

            e.stopPropagation();
            e.preventDefault();

            secretNumber = this.$el.find('#secretNumber').val();

            if (!secretNumber) {

                return alert('Please provide secret number');
            }

            $.ajax({
                url    : '/recovery/mobile',
                type   : 'POST',
                data   : {secretNumber: secretNumber},
                success: function (response) {
                    alert(response.success);
                    Backbone.history.navigate('#lullaby/recovery/password', {trigger: true});
                },
                error  : function (xhr) {
                    self.handleError(xhr);
                }
            });
        },

        handleError: function(xhr) {
            var self = this;

            switch (xhr.status) {
                case 403: // Wrong secret number
                    alert(xhr.responseJSON.fail);
                    self.$el.find('#secretNumber').val('');
                    break;

                case 422: // No secret number
                    alert(xhr.responseJSON.fail);
                    self.$el.find('#secretNumber').val('');
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