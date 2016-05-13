'use strict';

define([
    'backbone',
    'constants',
    'models/blog'
], function(Backbone, constant, BlogModel){

    return Backbone.Collection.extend({
        model  : BlogModel,
        url    : '/lullaby/blog',
        sortKey: 'id',

        comparator: function(blog) {
            return blog.get(this.sortKey);
        },

        sortByField: function(fieldName) {
            this.sortKey = fieldName;
            this.sort();
        },

        initialize: function(options){
            var self = this;

            options    = options       || {};
            this.page  = options.page  || constant.FIRST_PAGE;
            this.count = options.count || constant.AMOUNT_OF_TOPICS_PER_PAGE;

            this.fetchData(this.page, this.count, {
                success: function (collection, xhr, options) {
                    self.countTopics = collection.models[0].attributes.count;
                    self.countPages  = Math.ceil(self.countTopics / constant.AMOUNT_OF_TOPICS_PER_PAGE);
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
            var page;

            if (pageNumber > this.countPages || pageNumber < 0) {

                return alert('Not found such page');
            }

            page = pageNumber;

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
});