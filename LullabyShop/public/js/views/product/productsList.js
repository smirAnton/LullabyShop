'use strict';

define([
    'helper',
    'constant',
    'backbone',
    'underscore',
    'models/product',
    'collections/products',
    'text!templates/product/productsList.html'
], function (helper, constant, Backbone, _, ProductModel, Collection, productListTemplate) {

    return Backbone.View.extend({
        el      : "#products",
        template: _.template(productListTemplate),

        initialize: function (pageNumber) {
            var self   = this;
            this.page  = pageNumber;
            // use default amount products per page 12
            this.count = constant.pagination.PRODUCTS_PER_PAGE;

            this.collection = new Collection({
                reset: true,
                data : { page: self.page, count: self.count }
            });

            this.collection.on('sync', function() { self.render() }, self.collection);
            this.collection.on('sort', function() { self.render() }, self.collection);
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
            var productId = this.$el.find(e.currentTarget).data("id");
            var product   = this.collection.get(productId);

            e.stopPropagation();
            e.preventDefault();

            $.ajax({
                type   : 'POST',
                url    : '/lullaby/basket/add',
                data   : { productId: productId },
                success: function() {
                    APP.session.totalSum += product.attributes.price;
                    APP.session.basket.push(productId);

                    APP.channel.trigger('changeBasketStatus');
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
                countProducts: this.collection.countProducts,
                countPages   : this.collection.countPages,
                products     : this.collection.toJSON(),
                helper       : helper})
            );

            return this;
        }
    });
});