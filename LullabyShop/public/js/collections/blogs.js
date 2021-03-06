'use strict';

define([
    'backbone',
    'models/blog'
], function(Backbone, BlogModel){

    return Backbone.Collection.extend({
        url    : '/lullaby/blog',
        model  : BlogModel,
        sortKey: 'id',

        comparator: function(blog) {

            return blog.get(this.sortKey);
        },

        sortByField: function(fieldName) {
            this.sortKey = fieldName;
            this.sort();
        },

        initialize: function(options){
            var self      = this;
            var paginData = options.data;

            this.page     = paginData.page  || 1;
            this.count    = paginData.count || 4;

            this.fetchData(this.page, this.count, {
                success: function (response) {
                    self.countTopics = response.models[0].attributes.amount;
                    self.countPages  = Math.ceil(self.countTopics / 4);
                },
                error  : function (err, xhr) {
                    APP.handleError(xhr);
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

            APP.blogsPaginNavigate(page);

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

            APP.blogsPaginNavigate(page);

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

            APP.blogsPaginNavigate(page);

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