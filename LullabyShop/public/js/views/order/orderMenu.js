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

            this.render();

            APP.channel.on('addProductToBasket', function () {
                self.render();
            });
        },

        render: function () {
            this.$el.html(this.template({
                countProducts: APP.session.basket.length,
                totalSum     : APP.session.totalSum}));

            return this;
        }
    });
});


