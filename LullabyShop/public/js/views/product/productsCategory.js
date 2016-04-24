'use strict';

define([
    'backbone',
    'underscore',
    'models/product',
    'collections/productsCategory',
    'text!templates/product/productsList.html'
], function (Backbone, _, ProductModel, Collection, productsTemplate) {
    var View = Backbone.View.extend({
        el      : "#products",
        template: _.template(productsTemplate),

        initialize: function (categoryId) {
            var self = this;

            this.collection = new Collection(categoryId);
            // listen reset event
            this.collection.on('reset', function() {
                self.countProducts = self.collection.countProducts;
                self.countPages    = self.collection.countPages;
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

        onSortByPrice: function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.collection.sortByField('price');
        },

        onSortByDate: function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.collection.sortByField('createdDate');
        },

        onSortByTitle: function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.collection.sortByField('title');
        },

        onAddProduct: function (e) {
            var productId;
            var product;

            e.stopPropagation();
            e.preventDefault();

            productId = $(e.currentTarget).data("id");

            product = new ProductModel({_id: productId});
            product.fetch({
                success: function () {
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

        onGoToPage: function (e) {
            var page;

            e.stopPropagation();
            e.preventDefault();

            page = $(e.currentTarget).data("id");
            this.collection.goToPage(page);
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