'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/order/orderMenu.html'
], function (Backbone, _, orderMenuTemplate) {
    var View = Backbone.View.extend({
        el      : "#orderMenu",
        template: _.template(orderMenuTemplate),

        initialize: function () {
            var self = this;

            this.basket = JSON.parse(localStorage.getItem('basket')) || [];

            this.render();

            // listen user's event - add new product to basket
            APP.channel.on('addProductToBasket', function() {
                self.initialize();
            });
        },

        render: function () {
            this.$el.html(this.template({basket: this.basket}));

            return this;
        }
    });

    return View;
});


