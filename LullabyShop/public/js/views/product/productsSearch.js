'use strict';

define([
    'backbone',
    'underscore',
    'constants',
    'models/product',
    'collections/productsSearch',
    'text!templates/product/productsList.html'
], function (Backbone, _, Constant, ProductModel, ProductCollection, productListTemplate) {
    var View = Backbone.View.extend({
        el      : "#products",
        template: _.template(productListTemplate),

        initialize: function (word) {
            var self = this;

            this.collection = new ProductCollection(word);
            // listen reset event
            this.collection.on('reset', function() {
                if (self.collection.models.length) {

                    self.countProducts = self.collection.toJSON()[0].count;
                } else {

                    self.countProducts = 0;
                }
                self.countPages    = Math.ceil(self.countProducts / Constant.AMOUNT_OF_PRODUCTS_PER_PAGE);
                self.render()}, this);

            // listen sort event
            this.collection.on('sort', function() {self.render()}, this);
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
                    var basket;

                    // check if basket created in local storage
                    if (_.isNull(localStorage.getItem('basket'))) {

                        localStorage.setItem('basket', JSON.stringify([]));
                    }

                    // add new product to basket
                    basket = JSON.parse(localStorage.getItem('basket'));
                    basket.push(product);

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