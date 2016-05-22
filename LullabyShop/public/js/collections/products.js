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

        initialize: function(options){
            var self       = this;
            this.sortParam = options.data.sort || '';
            this.page      = options.data.page || 1;
            this.count     = constant.pagination.PRODUCTS_PER_PAGE;

            this.fetchData(this.page, this.count, this.sortParam, {
                success: function (response) {
                    self.countProducts = response.toJSON()[0].amount;
                    self.countPages    = Math.ceil(self.countProducts / self.count);
                },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        fetchData: function (page, count, sort, options) {
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
                    count: count,
                    sort : sort
                },
                success: success,
                error  : error
            });
        },

        nextPage: function(){
            var self     = this;
            var page     = parseInt(this.page) + 1;
            var nextPage = page > this.countPages ? this.countPages : page;
            var navigateUrl = '#lullaby/shop/p=' + nextPage;

            if (this.sortParam !== 'title') {
                navigateUrl = navigateUrl + '/s=' + this.sortParam;
            }

            Backbone.history.navigate(navigateUrl);

            this.fetchData(nextPage, this.count, this.sortParam, {
                success: function () {
                    self.page = nextPage;
                },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        prevPage: function(){
            var self = this;
            var prevPage = parseInt(this.page) - 1 || 1;
            var navigateUrl = '#lullaby/shop/p=' + prevPage;

            if (this.sortParam !== 'title') {
                navigateUrl = navigateUrl + '/s=' + this.sortParam;
            }

            Backbone.history.navigate(navigateUrl);

            this.fetchData(prevPage, this.count, this.sortParam, {
                success: function () {
                    self.page = prevPage;
                },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        goToPage: function(page){
            var self = this;
            var navigateUrl = '#lullaby/shop/p=' + page;

            if (this.sortParam !== 'title') {
                navigateUrl = navigateUrl + '/s=' + this.sortParam;
            }

            Backbone.history.navigate(navigateUrl);

            this.fetchData(page, this.count, this.sortParam, {
                success: function () {
                    self.page = page;
                },
                error  : function (model, xhr) {
                    APP.handleError(xhr);
                }
            });
        },
        
        globalSortByField: function (sortParam) {
            this.page = 1;
            this.sortParam = sortParam || null;

            Backbone.history.navigate('#lullaby/shop/p=' + this.page + '/s=' + sortParam);

            this.fetchData(this.page, this.count, this.sortParam, {
                success: function () { },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        }
    });
});