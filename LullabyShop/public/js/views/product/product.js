'use strict';

define([
    'helper',
    'moment',
    'constant',
    'backbone',
    'validator',
    'underscore',
    'models/comment',
    'collections/products',
    'text!templates/product/productList.html',
    'text!templates/product/productDetails.html'
], function (helper, moment, constant, Backbone, validator, _, CommentModel, Collection, productsTemplate, productTemplate) {

    return Backbone.View.extend({
        el      : "#products",
        template: _.template(productsTemplate),

        initialize: function (data) {
            var self = this;
            var data = data || { };

            // pagination params
            this.page   = data.page   || 1;
            this.productId = data.productId || undefined;
            this.sort   = data.sort   || undefined;
            this.filter = data.filter || undefined;
            this.title  = data.title  || undefined;
            this.search = data.search || undefined;

            // get products
            self.collection = new Collection({
                reset: true,
                data : {
                    productId: self.productId,
                    search   : self.search,
                    filter   : self.filter,
                    title    : self.title,
                    page     : self.page,
                    sort     : self.sort }
            });

            // subscribe on sync and sort events
            self.collection.on('sync', function() { self.render() }, self.collection);
            self.collection.on('sort', function() { self.render() }, self.collection);

            // subscribe on categories events
            APP.channel.on('selectGlobalSort', self.onSelectGlobalSort, self);
            APP.channel.on('selectCategory',   self.onSelectCategory,   self);
            APP.channel.on('selectFilter',     self.onSelectFilters,    self);
        },

        events: {
            'click #selectCategoryBtn': 'onSelectCategory',
            'click .selectProductBtn' : 'onSelectProduct',
            'click #leaveCommentBtn'  : 'onLeaveComment',
            'click .selectPageSort'   : 'onSelectPageSort',
            'click #addProductBtn'    : 'onAddProduct',
            'click #selectBuyBtn'     : 'onSelectBuy',
            'click #goToPageBtn'      : 'onGoToPage',
            'click #nextPageBtn'      : 'onNextPage',
            'click #prevPageBtn'      : 'onPrevPage'
        },

        onLeaveComment: function (e) {
            var self     = this;
            var $comment = this.$el.find('#comment');
            var error;
            var text;
            var data;

            e.stopPropagation();
            e.preventDefault();

            // get user comment
            text = $comment.val();

            // validate comment
            if (error = validator.isComment(text)) {
                return APP.showWarningAlert(error);
            }

            data = {
                text   : text,
                product : this.product._id,
                username: APP.session.username
            };

            new CommentModel()
                .save(data, {
                    success: function () {
                        // clean comment's text area field
                        $comment.val('');

                        // add comment to product page
                        self.$el.find('#addComment').before(
                            '<div class="col-md-12">' + author +
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

        onSelectBuy: function (e) {
            var self = this;
            var productId = self.model._id;

            e.preventDefault();

            $.ajax({
                type: 'POST',
                url : '/lullaby/basket/add',
                data: { productId: productId },
                success: function() {
                    APP.session.totalSum += self.model.price;
                    APP.session.basket.push(productId);

                    APP.channel.trigger('changeBasketStatus');
                    Backbone.history.navigate('#lullaby/checkout', { trigger: true });
                },
                error  : function (err) {
                    APP.handleError(xhr);
                }
            });
        },

        onSelectCategory: function (data) {
            this.collection.fetchCategoryProducts(data.categoryId);
            this.changeAndRenderTemplate(productsTemplate);
        },

        onSelectProduct: function (e) {
            var self = this;

            e.preventDefault();

            this.productId = this.$el.find('.selectProductBtn').data('id');
            this.collection.fetchProduct(this.productId);

            $.ajax({
                url: '/lullaby/product/' + this.productId,
                type: 'GET',
                success: function (product) {
                    self.model = product;
                    self.template = _.template(productTemplate);
                    self.render();
                },
                error: function (err) {
                    APP.handleError(err);
                }
            });
        },

        onSelectGlobalSort: function (data) {
            this.collection.globalSortByField(data.sortParam);
            this.changeAndRenderTemplate(productsTemplate);
        },

        onSelectFilters: function (data) {
            var filter = JSON.parse(data.filter);
            var index = filter.length - 1;
            var filterParams = '';

            for (; index >=0; index -= 1) {
                filterParams += filter[index];

                if (index !== 0) {
                    filterParams += '&';
                }
            }

            this.collection.fetchFilteredProducts(filterParams);
            this.changeAndRenderTemplate(productsTemplate);
        },

        onSelectPageSort: function(e) {
            var sortParam = this.$el.find(e.target).data('id');

            e.preventDefault();

            this.collection.sortByField(sortParam);
        },

        onAddProduct: function(e) {
            var productId = this.$el.find(e.currentTarget).data("id");
            var product   = this.collection.get(productId);

            e.stopPropagation();
            e.preventDefault();

            $.ajax({
                type       : 'POST',
                url        : '/lullaby/basket/add',
                data       : { productId: productId },
                success    : function() {
                    APP.session.totalSum += product.attributes.price;
                    APP.session.basket.push(productId);

                    APP.channel.trigger('changeBasketStatus');
                },
                error      : function(err) {
                    APP.handleError(err);
                }
            });
        },

        onNextPage: function (e) {
            e.preventDefault();

            this.collection.nextPage();
        },

        onPrevPage: function (e) {
            e.preventDefault();

            this.collection.prevPage();
        },

        onGoToPage: function(e) {
            var pageNumber = this.$el.find(e.target).data("id");

            e.preventDefault();

            this.collection.goToPage(pageNumber);
        },

        render: function () {
            this.$el.html(this.template({
                collection   : this.collection.toJSON(),
                countPages   : this.collection.countPages,
                countProducts: this.collection.countProducts,
                product      : this.model,
                helper       : helper,
                moment       : moment })
            );

            return this;
        },

        changeAndRenderTemplate: function (newTemplate) {
            this.template = _.template(newTemplate);
            this.render();
        }
    });
});