'use strict';

define([
    'backbone',
    'constants',
    'models/blog'
], function(Backbone, Constant, BlogModel){
    var Blogs = Backbone.Collection.extend({
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
            var paginationData = (options && options.data) || {};
            var self = this;
            var blog;

            this.page  = paginationData.page  || Constant.FIRST_PAGE_WITH_TOPICS;
            this.count = paginationData.count || Constant.AMOUNT_OF_TOPICS_PER_PAGE;

            blog = new BlogModel();
            blog.urlRoot = 'lullaby/blog/count';
            blog.fetch({
                success: function(response) {
                    self.countBlogs = response.attributes.amount;
                    self.countPages = Math.ceil(self.countBlogs / Constant.AMOUNT_OF_TOPICS_PER_PAGE);
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

    return Blogs;
});