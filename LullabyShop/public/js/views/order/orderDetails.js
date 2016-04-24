'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'models/order',
    'text!templates/order/orderDetails.html',
    'text!templates/order/orderForm.html'
], function (Backbone, _, UserModel, OrderModel, orderDetailsTemplate, orderFormTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(orderDetailsTemplate),

        initialize: function () {
            this.basket = JSON.parse(localStorage.getItem('basket')) || [];

            this.render();
        },

        events: {
            'click #removeProductFromBasketBtn': 'onRemoveProductFromBasket',
            'click #continueToBasketBtn'       : 'onContinueToBasket',
            'click #showOrderFormBtn'          : 'onShowOrderForm',
            'click #makeOrderBtn'              : 'onMakeOrder'
        },

        onRemoveProductFromBasket: function(e) {
            var self = this;
            var removeIndex;
            var transfer;
            var productId;
            var basket;

            e.stopPropagation();
            e.preventDefault();

            productId = $(e.currentTarget).data("id");
            basket    = JSON.parse(localStorage.getItem('basket'));

            // define remove product index in basket's array
            removeIndex = basket
                .map(function(product) { return product._id; })
                .indexOf(productId);

            // remove product from req.session basket
            transfer = new UserModel();
            transfer.urlRoot = 'lullaby/basket/remove';
            transfer.save({removeIndex: removeIndex}, {
                success: function(success) {},
                error  : function (error) {}
            });

            // remove product from user's basket
            basket.splice(removeIndex, 1);

            // ste updated basket to local storage
            localStorage.setItem('basket', JSON.stringify(basket));

            this.basket = basket;
            this.render();
        },

        onContinueToBasket: function(e) {
            e.stopPropagation();
            e.preventDefault();

            Backbone.history.navigate('#lyllaby/shop', {trigger: true});
        },

        onShowOrderForm: function(e) {
            var self = this;
            var userId;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userId = localStorage['userId'];

            if (userId) {
                user = new UserModel({_id: userId});
                user.fetch({
                    success: function() {
                        self.basket = user.attributes;
                        self.template = _.template(orderFormTemplate);
                        self.render();
                    },
                    error: function (err, xhr) {
                        alert(xhr.statusText);
                    }
                });
            } else {
                self.template = _.template(orderFormTemplate);
                self.render();
            }
        },

        onMakeOrder: function(e) {
            var self = this;
            var totalSum = 0;
            var firstname;
            var products = [];
            var surname;
            var userId;
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

            // calculate order total sum and add to products array every product's id from basket
            basket = JSON.parse(localStorage.getItem('basket'));
            _.each(basket, function(product) {
                totalSum += product.price;
                products.push(product._id);
            });

            this.basket = basket;

            order = new OrderModel({
                userFirstname: firstname,
                userSurname  : surname,
                userEmail    : email,
                userPhone    : phone,
                totalSum     : totalSum,
                products     : products,
                userId       : localStorage.getItem('userId')
            });

            order.save(null, {
                success: function(response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {
                        // clean user's basket
                        localStorage.setItem('basket', JSON.stringify([]));

                        alert('Thank you for shopping. Please check email with order number');
                        Backbone.history.navigate('lullaby/shop', {trigger: true});
                    }
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        render: function () {
            this.$el.html(this.template({basket: this.basket}));

            return this;
        }
    });

    return View;
});