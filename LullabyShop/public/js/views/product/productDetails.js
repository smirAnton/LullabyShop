'use strict';

define([
    'moment',
    'backbone',
    'validator',
    'underscore',
    'models/product',
    'models/comment',
    'text!templates/product/productDetails.html'
], function (moment, Backbone, validator, _, ProductModel, CommentModel, productDetailsTemplate) {

   return Backbone.View.extend({
        el      : "#products",
        template: _.template(productDetailsTemplate),

        initialize: function (productId) {
            var self = this;
      
            new ProductModel({ _id: productId })
                .fetch({
                    success: function (model) {
                        self.model = model.attributes;
                        self.render();
                    },
                    error: function (err, xhr) {
                        APP.handleError(xhr);
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
            var $comment = this.$el.find('#comment');
            var authorName;
            var text;
            var error;
            var data;

            e.stopPropagation();
            e.preventDefault();

            text = $comment.val();

            // validate comment
            if (error = validator.isComment(text)) {

                return APP.showWarningAlert(error);
            }

            authorName = APP.session.username;

            data = {
                text      : text,
                productId : this.model._id,
                authorName: authorName
            };

            new CommentModel()
                .save(data, {
                    success: function () {
                        // clean comment's text area field
                        $comment;

                        // add comment to product page by jQuery
                        self.$('#userComment').before(
                            '<div class="col-md-12">' + authorName +
                                '<span class="pull-right">today</span>' +
                                '<p>' + text + '</p><hr>' +
                            '</div>'
                        );
                    },
                    error: function (err, xhr) {
                        APP.handleError(xhr);
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
            this.$el.html(this.template({
                product: this.model,
                moment : moment
            }));

            return this;
        }
    });
});