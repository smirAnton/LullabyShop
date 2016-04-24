'use strict';

define([
    'backbone',
    'constants',
    'models/product'
], function(Backbone, Constant, ProductModel){
    var Collection = Backbone.Collection.extend({
        model  : ProductModel,
        url    : 'lullaby/product/search',
        sortKey: 'id',

        comparator: function(product) {
            return product.get(this.sortKey);
        },

        sortByField: function(fieldName) {
            this.sortKey = fieldName;
            this.sort();
        },

        initialize: function(word, options){
            var self = this;
            var paginationData = (options && options.data) || {};

            this.page  = paginationData.page   || Constant.FIRST_PAGE;
            this.count = paginationData.count  || Constant.AMOUNT_OF_PRODUCTS_PER_PAGE;
            this.word  = word                  || Constant.DEFAULT_SEARCHING_WORD;

            this.fetchData(this.page, this.count, this.word, {
                success: function (model, xhr, options) {
                    if (model.length) {

                        self.countProducts = model.toJSON()[0].count;
                    } else {

                        self.countProducts = 0;
                    }
                    self.countPages    = Math.ceil(self.countProducts / Constant.AMOUNT_OF_PRODUCTS_PER_PAGE);
                },
                error  : function (model, xhr, options) {
                    alert(xhr.statusText);
                }
            });
        },

        fetchData: function (page, count, word, options) {
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
                    count: count,
                    word : word
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

            this.fetchData(page, this.count, this.word, {
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

            this.fetchData(page, this.count, this.word, {
                success: function (model, xhr, options) {
                    self.page = page;
                },
                error  : function (xhr, options) {
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

            this.fetchData(page, this.count, this.word, {
                success: function (model, xhr, options) {
                    self.page = page;
                },
                error  : function (xhr, options) {
                    alert(xhr.statusText);
                }
            });
        }
    });

    return Collection;
});