'use strict';

define([
    'backbone',
    'constants',
    'models/product'
], function(Backbone, Constant, ProductModel){
    var Products = Backbone.Collection.extend({
        model     : ProductModel,
        url       : '/lullaby/product',
        sortKey   : 'id',

        comparator: function(product) {
            return product.get(this.sortKey);
        },

        sortByField: function(fieldName) {
            this.sortKey = fieldName;
            this.sort();
        },

        initialize: function(options){
            var paginationData = (options && options.data) || {};
            var self = this;
            var product;

            this.page  = paginationData.page  || Constant.FIRST_PAGE;
            this.count = paginationData.count || Constant.AMOUNT_OF_PRODUCTS_PER_PAGE;

             //find out amount of pages with products
            product = new ProductModel();
            product.urlRoot = 'lullaby/product/count';
            product.fetch({
                success: function(response) {
                    self.countProducts = response.attributes.amount;
                    self.countPages    = Math.ceil(self.countProducts / Constant.AMOUNT_OF_PRODUCTS_PER_PAGE);
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });

            this.fetchData(this.page, this.count, {
                success: function (model, xhr, options) {},
                error  : function (model, xhr, options) {
                    alert(xhr.statusText);
                }
            });
        },

        fetchData: function (page, count, options) {
            var success = (options && options.success) || function () {};
            var error   = (options && options.error)   || function () {};

            if (!(typeof success === 'function')) {
                success = function () {};
            }

            if (!(typeof error === 'function')) {
                error = function () {};
            }

            this.fetch({
                reset    : true,
                data: {
                    page : page,
                    count: count
                },
                success  : success,
                error    : error
            });
        },

        nextPage: function(){
            var self = this;

            var page = this.page + 1;
            if (page > self.countPages) {
                page = self.countPages
            }

            this.fetchData(page, this.count, {
                success: function (model, xhr, options) {
                    self.page = page;
                },
                error  : function (model, xhr, options) {
                    alert(xhr.statusText);
                }
            });
        },

        prevPage: function(){
            var self = this;
            var page = this.page - 1;

            page = page || 1;

            this.fetchData(page, this.count, {
                success: function (model, xhr, options) {
                    self.page = page;
                },
                error  : function (model, xhr, options) {
                    alert(xhr.statusText);
                }
            });
        },

        goToPage: function(pageNumber){
            var self = this;
            var page = pageNumber;

            if (page > this.countPages || page < 0) {
                return alert('Not found such page');
            }

            this.fetchData(page, this.count, {
                success: function (model, xhr, options) {
                    self.page = page;
                },
                error  : function (model, xhr, options) {
                    alert(xhr.statusText);
                }
            });
        }
    });

    return Products;
});