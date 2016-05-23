'use strict';

define([
    'helper',
    'constant',
    'backbone',
    'underscore',
    'collections/products',
    'text!templates/product/productsList.html'
], function (helper, constant, Backbone, _, Collection, productListTemplate) {

    return Backbone.View.extend({
        el      : "#products",
        template: _.template(productListTemplate),

        initialize: function (options) {
            var self    = this;
            var options = options || { };

            console.log(options);

            // pagination params
            this.id     = options.id     || undefined;
            this.page   = options.page   || 1;
            this.sort   = options.sort   || undefined;
            this.search = options.search || undefined;

            // get all categories titles and ids
            $.ajax({
                type       : 'GET',
                url        : 'lullaby/category',
                dataType   : 'json',
                contentType: "application/json",
                success    : function (categories) {
                    self.categories = categories;

                    // get products
                    self.collection = new Collection({
                        reset: true,
                        data : {
                            search: self.search,
                            page  : self.page,
                            sort  : self.sort,
                            id    : self.id }
                    });

                    self.collection.on('sync', function() { self.render() }, self.collection);
                    self.collection.on('sort', function() { self.render() }, self.collection);
                },
                error      : function (err) {
                    APP.handleError(err);
                }
            });
        },

        events: {
            'click #glSortByPriceBtn': 'onGlobalSortByPrice',
            'click #glSortByTitleBtn': 'onGlobalSortByTitle',
            'click #glSortByDateBtn' : 'onGlobalSortByDate',
            'click #sortByPriceBtn'  : 'onSortByPrice',
            'click #sortByTitleBtn'  : 'onSortByTitle',
            'click #sortByDateBtn'   : 'onSortByDate',
            'click #addProductBtn'   : 'onAddProduct',
            'click #goToPageBtn'     : 'onGoToPage',
            'click #nextPageBtn'     : 'onNextPage',
            'click #prevPageBtn'     : 'onPrevPage'
        },

        onGlobalSortByPrice: function (e) {
            e.preventDefault();

            this.collection.globalSortByField('price');
        },

        onGlobalSortByTitle: function (e) {
            e.preventDefault();

            this.collection.globalSortByField('title');
        },

        onGlobalSortByDate: function (e) {
            e.preventDefault();

            this.collection.globalSortByField('createdDate');
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

            console.log(productId)
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
            var pageNumber = this.$el.find(e.currentTarget).data("id");

            e.preventDefault();

            this.collection.goToPage(pageNumber);
        },

        render: function () {
            this.$el.html(this.template({
                collection   : this.collection.toJSON(),
                categories   : this.categories,
                countPages   : this.collection.countPages,
                countProducts: this.collection.countProducts,
                // function to chunk array
                helper       : helper})
            );

            return this;
        }
    });
});