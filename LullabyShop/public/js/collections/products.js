'use strict';

define([
    'backbone',
    'models/product'
], function(Backbone, ProductModel){

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
            var data;

            this.count     = 12; // amount of products per page
            this.id        = options.data.title  || undefined;
            this.page      = options.data.page   || 1;
            this.filter    = options.data.filter || undefined;
            this.search    = options.data.search || undefined;
            this.sortParam = options.data.sort   || undefined;

            // define query
            data = {
                id    : this.id,
                page  : this.page,
                sort  : this.sortParam,
                count : this.count,
                search: this.search,
                filter: this.filter
            };

            this.fetchData(data, {
                success: function (response) {
                    self.countProducts = response.toJSON()[0].amount;
                    self.countPages    = Math.ceil(self.countProducts / self.count);
                },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        fetchData: function (data, options) {
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
                data   : data,
                success: success,
                error  : error
            });
        },

        nextPage: function(){
            var self = this;
            var page = parseInt(this.page) + 1;
            var nextPage = page > this.countPages ? this.countPages : page;
            var data = {
                id    : this.id,
                page  : nextPage,
                sort  : this.sortParam,
                count : this.count,
                search: this.search,
                filter: this.filter
            };

            this.changeUrl(nextPage);
            this.fetchData(data, {
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
            var data = {
                id    : this.id,
                page  : prevPage,
                sort  : this.sortParam,
                count : this.count,
                search: this.search,
                filter: this.filter
            };

            this.changeUrl(prevPage);
            this.fetchData(data, {
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
            var data = {
                id    : this.id,
                page  : page,
                sort  : this.sortParam,
                count : this.count,
                search: this.search,
                filter: this.filter
            };

            this.changeUrl(page);
            this.fetchData(data, {
                success: function () {
                    self.page = page;
                },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },
        
        globalSortByField: function (sortParam) {
            var data;
            this.page = 1;
            this.sortParam = sortParam;

            data = {
                id    : this.id,
                page  : this.page,
                sort  : this.sortParam,
                count : this.count,
                search: this.search,
                filter: this.filter
            };

            this.changeUrl(this.page);
            this.fetchData(data, {
                success: function () { },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        fetchCategoryProducts: function (id) {
            var self = this;
            var data;

            this.id        = id;
            this.page      = 1;
            this.search    = undefined;
            this.filter    = undefined;
            this.sortParam = undefined;

            data = {
                id    : this.id,
                page  : this.page,
                sort  : this.sortParam,
                count : this.count,
                search: this.search,
                filter: this.filter
            };

            this.changeUrl(this.page);

            this.fetchData(data, {
                success: function (response) {
                    self.countProducts = response.toJSON()[0].amount;
                    self.countPages    = Math.ceil(self.countProducts / self.count);
                },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        fetchFilteredProducts: function (filterParams) {
            var self = this;
            var data;
            
            // define query params
            this.page      = 1;
            this.filter    = filterParams;
            this.id        = undefined;
            this.search    = undefined;
            this.sortParam = undefined;

            data = {
                id    : this.id,
                page  : this.page,
                sort  : this.sortParam,
                count : this.count,
                search: this.search,
                filter: this.filter
            };

            this.changeUrl(this.page);

            this.fetchData(data, {
                success: function (response) {
                    self.countProducts = response.toJSON()[0].amount;
                    self.countPages    = Math.ceil(self.countProducts / self.count);
                },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        changeUrl: function(page) {
            var navigateUrl = '#lullaby/shop';

            if (this.id) {
                navigateUrl += '/id=' + this.id;
            }

            if (this.filter) {
                navigateUrl += '/f=' + this.filter;
            }

            if (this.sortParam) {
                navigateUrl += '/s=' + this.sortParam;
            }

            if (this.search) {
                navigateUrl += '/search=' + this.search;
            }

            navigateUrl += '/p=' + page;
            // change url
            Backbone.history.navigate(navigateUrl);
        }
    });
});