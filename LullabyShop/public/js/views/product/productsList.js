'use strict';

define([
    'backbone',
    'underscore',
    'constants',
    'models/product',
    'collections/products',
    'text!templates/product/productsList.html'
], function (Backbone, _, Constant, ProductModel, ProductCollection, productListTemplate) {
    var View = Backbone.View.extend({
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
            e.stopPropagation();
            e.preventDefault();

            this.collection.sortByField('price');
        },

        onSortByDate: function(e) {
            e.stopPropagation();
            e.preventDefault();

            this.collection.sortByField('createdDate');
        },

        onSortByTitle: function(e) {
            e.stopPropagation();
            e.preventDefault();

            this.collection.sortByField('title');
        },

        onAddProduct: function(e) {
            var productId;
            var product;

            e.stopPropagation();
            e.preventDefault();

            productId = $(e.currentTarget).data("id");

            product = new ProductModel({_id: productId});
            product.fetch({
                success: function() {
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

                    localStorage.setItem('basket', JSON.stringify(basket));

                    // trigger add product event
                    APP.channel.trigger('addProductToBasket');
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        onNext: function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.collection.nextPage();
        },

        onPrev: function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.collection.prevPage();
        },

        onGoToPage: function(e) {
            var pageNumber;

            e.stopPropagation();
            e.preventDefault();

            pageNumber = $(e.currentTarget).data("id");
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

    return View;
});