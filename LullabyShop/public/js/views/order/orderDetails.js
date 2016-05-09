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

        onRemoveProductFromBasket: function (e) {
            var self = this;
            var removeIndex;
            var productId;
            var basket;

            e.stopPropagation();
            e.preventDefault();

            productId = $(e.currentTarget).data("id");
            basket    = JSON.parse(localStorage.getItem('basket'));

            // define remove product index in basket's array
            removeIndex = basket
                .map(function (product) { return product._id; })
                .indexOf(productId);

            $.ajax({
                url    : '/lullaby/basket/remove',
                type   : 'POST',
                data   : {removeIndex: removeIndex},
                success: function(response) {
                    basket.splice(removeIndex, 1);

                    localStorage.setItem('basket', JSON.stringify(basket));

                    self.basket = basket;
                    self.render();
                },
                error  : function(err, xhr) {
                    self.handleError(xhr);
                }
            });
        },

        onContinueToBasket: function (e) {
            e.stopPropagation();
            e.preventDefault();

            Backbone.history.navigate('#lyllaby/shop', {trigger: true});
        },

        onShowOrderForm: function (e) {
            var self = this;
            var userId;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userId = localStorage.getItem('userId');

            if (userId) {
                user = new UserModel({_id: userId});
                user.fetch({
                    success: function () {
                        self.userData = user.attributes;
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
                    localStorage.setItem('basket', JSON.stringify([]));

                    alert(xhr.success);
                    Backbone.history.navigate('lullaby/shop', {trigger: true});
                },
                error: function (err, xhr) {
                    self.handleError(xhr);
                }
            });
        },

        handleError: function (xhr) {
            switch (xhr.status) {
                case 400: // basket is empty (nothing to delete)
                    alert(xhr.responseJSON.fail);
                    break;

                case 422: // no product to add in basket
                    alert(xhr.responseJSON.fail);
                    break;

                default:
                    break;
            }
        },

        render: function () {
            this.$el.html(this.template({
                basket: this.basket,
                user  : this.userData})
            );

            return this;
        }
    });

    return View;
});