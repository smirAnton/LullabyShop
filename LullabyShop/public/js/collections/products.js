'use strict';

define([
    'constant',
    'backbone',
    'models/product'
], function(constant, Backbone, ProductModel){

    return Backbone.Collection.extend({
        url    : '/lullaby/product',
        model  : ProductModel,
        sortKey: 'id',

        comparator: function(product) {

            return product.get(this.sortKey);
        },

        sortByField: function(fieldName) {
            this.sortKey = fieldName;
            this.sort();
        },

        initialize: function(pageNumber){
            var self   = this;
            this.page  = pageNumber || 1;
            this.count = constant.pagination.PRODUCTS_PER_PAGE;

            this.fetchData(this.page, this.count, {
                success: function (response) {
                    self.countProducts = response.toJSON()[0].amount;
                    self.countPages    = Math.ceil(self.countProducts / self.countProducts);
                },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });


            //var self = this;
            //
            //options    = options       || {};
            //this.page  = options.page  || 1;
            //this.count = options.count || 12;
            //
            //if (options.categoryId) {
            //
            //    this.url = '/lullaby/category/' + options.categoryId;
            //} else if (options.searchWord){
            //
            //    this.url = '/lullaby/product/search/' + options.searchWord;
            //} else if (options.filter){
            //
            //    this.url = '/lullaby/product/filter/' + options.filter;
            //} else {
            //
            //    this.url = '/lullaby/product';
            //}
            //
            //this.fetchData(this.page, this.count, {
            //    success: function (collection, xhr, options) {
            //        self.countProducts = collection.models[0].attributes.count;
            //        self.countPages    = Math.ceil(self.countProducts / 12);
            //    },
            //    error  : function (err, xhr, options) {
            //        alert(xhr.statusText);
            //    }
            //});
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
                reset  : true,
                data   : {
                    page : page,
                    count: count
                },
                success: success,
                error  : error
            });
        },

        nextPage: function(){
            var self = this;
            var page = (this.page + 1 > this.countPages) ? this.countPages : this.page + 1;

            APP.productsPaginNavigate(page);

            this.fetchData(page, this.count, {
                success: function () {
                    self.page = page;
                },
                error  : function (model, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        prevPage: function(){
            var self = this;
            var page = this.page - 1 || 1;

            APP.productsPaginNavigate(page);

            this.fetchData(page, this.count, {
                success: function () {
                    self.page = page;
                },
                error  : function (model, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        goToPage: function(pageNumber){
            var self = this;
            var page = (pageNumber > this.countPages || pageNumber < 0) ? this.countPages : pageNumber;

            APP.productsPaginNavigate(page);

            this.fetchData(page, this.count, {
                success: function () {
                    self.page = page;
                },
                error  : function (model, xhr) {
                    APP.handleError(xhr);
                }
            });
        }
    });
});