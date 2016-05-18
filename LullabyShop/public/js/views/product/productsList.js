'use strict';

define([
    'constant',
    'backbone',
    'underscore',
    'models/product',
    'collections/products',
    'text!templates/product/productsList.html'
], function (constant, Backbone, _, ProductModel, ProductCollection, productListTemplate) {

    return Backbone.View.extend({
        el      : "#products",
        template: _.template(productListTemplate),

        initialize: function (options) {
            var self = this;
            var searchWord;
            var categoryId;
            var filter;
            var count;
            var page;

            options    = options       || {};
            page       = options.page  || 1;
            count      = options.count || 12;
            categoryId = options.categoryId;
            searchWord = options.searchWord;
            filter     = options.filter;

            this.collection = new ProductCollection({
                reset     : true,
                searchWord: searchWord,
                categoryId: categoryId,
                filter    : filter,
                data: {
                    page  : page,
                    count : count
                }
            });

            this.collection.on('sync', function() {
                self.countProducts = self.collection.countProducts;
                self.countPages    = self.collection.countPages;
                self.render();}, self.collection);

            this.collection.on('sort', function() {self.render()}, self.collection);
        },

        events: {
            'click a#sortByPriceBtn': 'onSortByPrice',
            'click a#sortByTitleBtn': 'onSortByTitle',
            'click a#sortByDateBtn' : 'onSortByDate',
            'click a#addProductBtn' : 'onAddProduct',
            'click a#nextBtn'       : 'onNext',
            'click a#prevBtn'       : 'onPrev',
            'click a#goToBtn'       : 'onGoToPage'
        },

        onSortByPrice: function(e) {
            e.preventDefault();

            this.collection.sortByField('price');
        },

        onSortByDate: function(e) {
            e.preventDefault();

            this.collection.sortByField('createdDate');
        },

        onSortByTitle: function(e) {
            e.preventDefault();

            this.collection.sortByField('title');
        },

        onAddProduct: function(e) {
            var productId;
            var product;

            e.stopPropagation();
            e.preventDefault();

            productId = this.$el.find(e.currentTarget).data("id");
            product   = this.collection.get(productId);

            $.ajax({
                type   : 'POST',
                url    : '/lullaby/basket/add',
                data   : {productId: productId},
                success: function() {
                    APP.session.totalSum += product.attributes.price;
                    APP.session.basket.push(productId);

                    APP.channel.trigger('addProductToBasket');
                },
                error: function(err) {
                    APP.handleError(err);
                }
            });
        },

        onNext: function (e) {
            e.preventDefault();

            this.collection.nextPage();
        },

        onPrev: function (e) {
            e.preventDefault();

            this.collection.prevPage();
        },

        onGoToPage: function(e) {
            var pageNumber = this.$el.find(e.currentTarget).data("id");

            e.preventDefault();

            this.collection.goToPage(pageNumber);
        },

        render: function () {
            this.$el.html(this.template({
                countProducts: this.countProducts,
                countPages   : this.countPages,
                products     : this.collection}));

            return this;
        }
    });
});