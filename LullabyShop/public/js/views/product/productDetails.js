'use strict';

define([
    'backbone',
    'underscore',
    'models/product',
    'models/comment',
    'text!templates/product/productDetails.html'
], function (Backbone, _, ProductModel, CommentModel, productDetailsTemplate) {
    var View = Backbone.View.extend({
        el      : "#products",
        template: _.template(productDetailsTemplate),

        initialize: function (productId) {
            var self = this;
            var product;

            product = new ProductModel({_id: productId});
            product.fetch({
                success: function (model) {
                    self.model = model.attributes;
                    self.render();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        events: {
            'click #addInWishListBtn': 'onAddInWishList',
            'click #leaveCommentBtn' : 'onLeaveComment',
            'click #buyBtn'          : 'onBuy'
        },

        onAddInWishList: function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.addProductToBasket(this.model);

            APP.channel.trigger('basket');
        },

        onLeaveComment: function (e) {
            var self = this;
            var commentText;
            var productId;
            var username;
            var options;
            var comment;

            e.stopPropagation();
            e.preventDefault();

            commentText = this.$el.find('#comment').val();
            this.$el.find('#comment').val('');

            if (!commentText && commentText.trim().length) {

                return alert('Please provide comment text');
            }

            username = localStorage.getItem('userFirstname');

            productId = this.model._id;

            options = {
                commentText: commentText,
                productId  : productId,
                username   : username
            };

            comment = new CommentModel();
            comment.save(options, {
                success: function () {
                    // add comment to product page by jQuery
                    self.$('#userComment').before(
                        '<div class="col-md-12">' +
                            username +
                            '<span class="pull-right">today</span>' +
                            '<p>' + commentText + '</p><hr>' +
                        '</div>'
                    );
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        onBuy: function (e) {
            var self = this;
            var productId;
            var product;

            e.stopPropagation();
            e.preventDefault();

            // get product id
            productId = $(e.currentTarget).data("id");

            product = new ProductModel({_id: productId});
            product.fetch({
                success: function () {
                    // add product to basket
                    self.addProductToBasket(product);
                    // navigate user to make order
                    Backbone.history.navigate('lullaby/checkout', {trigger: true});
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        addProductToBasket: function(product) {
            var basket = JSON.parse(localStorage.getItem('basket')) || [];

            $.ajax({
                url: '/lullaby/basket/add',
                type: 'POST',
                data: {product: JSON.stringify(product)},
                success: function(response, xhr) {
                    basket.push(product);
                    localStorage.setItem('basket', JSON.stringify(basket));

                    APP.channel.trigger('addProductToBasket');
                },
                error  : function (err, xhr) {
                    alert(xhr.statusText);
                }
            })
        },

        render: function () {
            this.$el.html(this.template({product: this.model}));

            return this;
        }
    });

    return View;
});