'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'models/order',
    'text!templates/order/orderDetails.html',
    'text!templates/order/orderForm.html'
], function (Backbone, _, UserModel, OrderModel, orderDetailsTemplate, orderFormTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(orderDetailsTemplate),

        initialize: function () {
            var self = this;

            $.ajax({
                url : '/lullaby/basket/details',
                type: 'GET',
                success: function(response) {
                    self.collection = JSON.parse(response.products);
                    self.totalSum   = response.totalSum;
                    self.count      = response.count;

                    self.render();
                },
                error: function(err) {
                    APP.handleError(err);
                }
            });
        },

        events: {
            'click #removeProductFromBasketBtn': 'onRemoveProductFromBasket',
            'click #continueToBasketBtn'       : 'onContinueToBasket',
            'click #showOrderFormBtn'          : 'onShowOrderForm',
            'click #makeOrderBtn'              : 'onMakeOrder'
        },

        onRemoveProductFromBasket: function (e) {
            var self = this;
            var productId;

            e.stopPropagation();
            e.preventDefault();

            productId = $(e.currentTarget).data("id");

            $.ajax({
                url    : '/lullaby/basket/remove',
                type   : 'POST',
                data   : {productId: productId},
                success: function(response) {
                    self.initialize();
                },
                error  : function(err) {
                    APP.handleError(err);
                }
            });
        },

        onContinueToBasket: function (e) {
            e.preventDefault();

            APP.navigate('#lyllaby/shop');
        },

        onShowOrderForm: function (e) {
            var self = this;

            e.preventDefault();

            if (APP.loggedIn) {
                $.ajax({
                    url    : '/lullaby/user/personal',
                    type   : 'GET',
                    success: function(response) {
                        self.userData = response;
                        self.template = _.template(orderFormTemplate);
                        self.render();
                    },
                    error  : function(err) {
                        APP.handleError(err);
                    }
                });
            } else {
                this.userData = {};
                self.template = _.template(orderFormTemplate);
                self.render();
            }
        },

        onMakeOrder: function (e) {
            var self     = this;
            var products = [];
            var firstname;
            var surname;
            var basket;
            var order;
            var phone;
            var email;

            e.stopPropagation();
            e.preventDefault();

            firstname = this.$el.find('#firstname').val();
            surname   = this.$el.find('#surname').val();
            email     = this.$el.find('#email').val();
            phone     = this.$el.find('#phone').val();

            if (!firstname || !surname || !email || !phone) {

                return alert('Please fill all form\'s fields');
            }

            basket = JSON.parse(localStorage.getItem('basket'));
            _.each(basket, function (product) {
                products.push(product._id);
            });

            order = new OrderModel({
                firstname: firstname,
                products : products,
                surname  : surname,
                email    : email,
                phone    : phone
            });

            order.save(null, {
                success: function (response, xhr) {
                    APP.notification(xhr.success);
                    Backbone.history.navigate('lullaby/shop', {trigger: true});
                },
                error: function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        render: function () {
            this.$el.html(this.template({
                collection: this.collection,
                totalSum: this.totalSum,
                count   : this.count,
                user  : this.userData})
            );

            return this;
        }
    });
});