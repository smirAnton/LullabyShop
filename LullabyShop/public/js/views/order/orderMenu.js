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
            this.basket = APP.session.basket;

            this.render();

            APP.channel.on('addProductToBasket', function () {
                self.initialize();
            });
        },

        render: function () {
            this.$el.html(this.template({basket: this.basket}));

            return this;
        }
    });
});


