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
            var self    = this;
            var options = options || { };

            this.count     = constant.pagination.PRODUCTS_PER_PAGE;
            this.page      = options.data.page   || 1;
            this.id        = options.data.id     || undefined;
            this.search    = options.data.search || undefined;
            this.sortParam = options.data.sort   || undefined;

            this.fetchData(this.page, this.count, this.sortParam, this.search, this.id, {
                success: function (response) {
                    self.countProducts = response.toJSON()[0].amount;
                    self.countPages    = Math.ceil(self.countProducts / self.count);
                },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        fetchData: function (page, count, sort, search, id, options) {
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
                    id    : id,
                    page  : page,
                    sort  : sort,
                    count : count,
                    search: search
                },
                success: success,
                error  : error
            });
        },

        nextPage: function(){
            var self = this;
            var page = parseInt(this.page) + 1;
            var nextPage = page > this.countPages ? this.countPages : page;

            this.changeUrl(nextPage);
            this.fetchData(nextPage, this.count, this.sortParam, this.search, this.id, {
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

            this.changeUrl(prevPage);
            this.fetchData(prevPage, this.count, this.sortParam, this.search, this.id, {
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

            this.changeUrl(page);
            this.fetchData(page, this.count, this.sortParam, this.search, this.id, {
                success: function () {
                    self.page = page;
                },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },
        
        globalSortByField: function (sortParam) {
            this.page = 1;
            this.sortParam = sortParam;

            this.changeUrl(this.page);
            this.fetchData(this.page, this.count, this.sortParam, this.search, this.id, {
                success: function () { },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        changeUrl: function(page) {
            var navigateUrl = '#lullaby/shop';

            if (this.id) {
                navigateUrl = navigateUrl + '/id=' + this.id;
            }

            if (this.sortParam) {
                navigateUrl = navigateUrl + '/s=' + this.sortParam;
            }

            if (this.search) {
                navigateUrl = navigateUrl + '/search=' + this.search;
            }

            navigateUrl = navigateUrl + '/p=' + page;
            // change url
            Backbone.history.navigate(navigateUrl);
        }
    });
});