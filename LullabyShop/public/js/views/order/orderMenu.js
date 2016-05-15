'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/order/orderMenu.html'
], function (Backbone, _, orderMenuTemplate) {

    return Backbone.View.extend({
        el      : "#orderMenu",
        template: _.template(orderMenuTemplate),

        initialize: function () {
            var self = this;

            $.ajax({
                url : '/lullaby/basket',
                type: 'GET',
                success: function(response) {
                    self.totalSum = response.totalSum;
                    self.count    = response.count;
                    self.render();
                },
                error: function(err) {
                    APP.notification(err);
                }
            });

            APP.channel.on('addProductToBasket', function () {
                self.initialize();
            });
        },

        render: function () {
            this.$el.html(this.template({totalSum: this.totalSum, count: this.count}));

            return this;
        }
    });
});


