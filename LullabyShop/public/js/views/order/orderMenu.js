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
                url    : '/session',
                type   :'GET',
                success: function(session){
                    APP.session.basket   = session.basket   || [];
                    APP.session.totalSum = session.totalSum || 0;

                    self.render();
                },
                error  : function(err){
                    APP.handleError(err);
                }
            });

            APP.channel.on('changeBasketStatus', function() { self.render(); });
        },

        render: function () {
            this.$el.html(this.template({
                countProducts: APP.session.basket.length,
                totalSum     : APP.session.totalSum}));

            return this;
        }
    });
});


