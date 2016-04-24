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

            APP.productId = productId;
            localStorage.setItem('productId', productId);

            product = new ProductModel({_id: productId});
            product.fetch({
                success: function () {
                    self.collection = product.attributes;
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
            var self = this;
            var productId;
            var product;

            e.stopPropagation();
            e.preventDefault();

            productId = $(e.currentTarget).data("id");

            product = new ProductModel({_id: productId});
            product.fetch({
                success: function () {
                    // add product to basket
                    self.addProductToBasket(product);
                    // trigger add product event
                    APP.channel.trigger('addProductToBasket');
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        onLeaveComment: function (e) {
            var self = this;
            var userFirstname;
            var commentText;
            var productId;
            var options;
            var comment;

            e.stopPropagation();
            e.preventDefault();

            // get user's comment
            commentText = this.$el.find('#comment').val();
            // clear input field
            this.$el.find('#comment').val('');

            // validate comment
            if (!commentText && commentText.trim().length) {

                return alert('Please provide comment text');
            }

            productId     = localStorage.getItem('productId');
            userFirstname = localStorage.getItem('userFirstname');

            options = {
                authorName: userFirstname,
                productId : productId,
                text      : commentText
            };

            // save comment in db
            comment = new CommentModel();
            comment.save(options, {
                success: function () {
                    // add comment to product page by jQuery
                    self.$('#userComment').before(
                        '<div class="col-md-12">' + userFirstname + '<span class="pull-right">today</span><p>' +
                        commentText + '</p><hr></div>'
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
            var transfer;
            var basket;
            // check if basket created in local storage
            if (_.isNull(localStorage.getItem('basket'))) {

                localStorage.setItem('basket', JSON.stringify([]));
            }
            // add new product to basket
            basket = JSON.parse(localStorage.getItem('basket'));
            basket.push(product);

            // save selected product in req.session basket
            transfer = new ProductModel();
            transfer.urlRoot = 'lullaby/basket/add';
            transfer.save({product: product}, {
                success: function(success) {},
                error  : function (error) {}
            });

            // save basket in local storage
            localStorage.setItem('basket', JSON.stringify(basket));
        },

        render: function () {
            this.$el.html(this.template({product: this.collection}));

            return this;
        }
    });

    return View;
});