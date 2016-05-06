'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/activation/activateByMobile.html'
], function (Backbone, _, activationTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(activationTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #activateBtn': 'onActivate'
        },

        onActivate : function(e) {
            var self = this;
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
                    alert(response.success);
                    Backbone.history.navigate('#lullaby/login', {trigger: true});
                },
                error  : function (xhr) {
                    self.handleError(xhr)
                }
            });
        },

        handleError: function(xhr) {
            var self = this;
            switch (xhr.status) {
                case 404: // if user is not registered
                    alert(xhr.responseJSON.fail);
                    self.$el.find('#secret').val('');
                    break;

                case 422: // if user has already activated registration
                    alert(xhr.responseJSON.fail);
                    self.$el.find('#secret').val('');
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