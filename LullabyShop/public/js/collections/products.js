'use strict';

define([
    'backbone',
    'models/product'
], function(Backbone, ProductModel){
    var Products = Backbone.Collection.extend({
        model     : ProductModel,
        sortKey   : 'id',

        comparator: function(product) {
            return product.get(this.sortKey);
        },

        sortByField: function(fieldName) {
            this.sortKey = fieldName;
            this.sort();
        },

        initialize: function(options){
            var self = this;

            options         = options       || {};
            this.page       = options.page  || 1;
            this.count      = options.count || 12;

            if (options.categoryId) {

                this.url = '/lullaby/category/' + options.categoryId;
            } else if (options.searchWord){

                this.url = '/lullaby/product/search/' + options.searchWord;
            } else if (options.filter){

                this.url = '/lullaby/product/filter/' + options.filter;
            } else {

                this.url = '/lullaby/product';
            }

            this.fetchData(this.page, this.count, {
                success: function (collection, xhr, options) {
                    self.countProducts = collection.models[0].attributes.count;
                    self.countPages    = Math.ceil(self.countProducts / 12);
                },
                error  : function (err, xhr, options) {
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
                success: function (collection, xhr, options) {
                    self.page = page;
                },
                error  : function (err, xhr, options) {
                    alert(xhr.statusText);
                }
            });
        },

        prevPage: function(){
            var self = this;
            var page = this.page - 1;

            page = page || 1;

            this.fetchData(page, this.count, {
                success: function (collection, xhr, options) {
                    self.page = page;
                },
                error  : function (err, xhr, options) {
                    alert(xhr.statusText);
                }
            });
        },

        goToPage: function(pageNumber){
            var self = this;
            var page;

            if (pageNumber > this.countPages || pageNumber < 0) {

                return alert('Not found such page');
            }

            page = pageNumber;

            this.fetchData(page, this.count, {
                success: function (collection, xhr, options) {
                    self.page = page;
                },
                error  : function (err, xhr, options) {
                    alert(xhr.statusText);
                }
            });
        }
    });

    return Products;
});