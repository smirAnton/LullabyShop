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

        initialize: function (data) {
            var self = this;
            var data = data || { };

            // pagination params
            this.page   = data.page   || 1;
            this.sort   = data.sort   || undefined;
            this.filter = data.filter || undefined;
            this.title  = data.title  || undefined;
            this.search = data.search || undefined;

            // get products
            self.collection = new Collection({
                reset: true,
                data : {
                    search: self.search,
                    filter: self.filter,
                    title : self.title,
                    page  : self.page,
                    sort  : self.sort }
            });

            // subscribe on sync and sort events
            self.collection.on('sync', function() { self.render() }, self.collection);
            self.collection.on('sort', function() { self.render() }, self.collection);

            // subscribe on select category event
            APP.channel.on('selectedCategory', self.onSelectCategory, self);

            // subscribe on select global sort event
            APP.channel.on('selectGlobalSort', self.onSelectGlobalSort, self);

            // subscribe on select filters event
            APP.channel.on('selectedFilter', self.onSelectFilters, self);
        },

        events: {
            'click #selectCategoryBtn': 'onSelectCategory',
            'click .selectPageSort'   : 'onSelectPageSort',
            'click #addProductBtn'    : 'onAddProduct',
            'click #goToPageBtn'      : 'onGoToPage',
            'click #nextPageBtn'      : 'onNextPage',
            'click #prevPageBtn'      : 'onPrevPage'
        },

        onSelectCategory: function (data) {
            this.collection.fetchCategoryProducts(data.categoryId)
        },

        onSelectGlobalSort: function (data) {
            this.collection.globalSortByField(data.sortParam);
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
                categories   : this.categories,
                countPages   : this.collection.countPages,
                countProducts: this.collection.countProducts,
                helper       : helper})
            );

            return this;
        }
    });
});