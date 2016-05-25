'use strict';

define([
    'helper',
    'backbone',
    'validator',
    'underscore',
    'collections/blogs',
    'text!templates/blog/blogList.html'
], function (helper, Backbone, validator, _, Collection, blogListTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(blogListTemplate),

        initialize: function (pageNumber) {
            var self   = this;
            this.page  = pageNumber || 1;
            this.count = 4;

            this.collection = new Collection({
                reset: true,
                data : { page: self.page, count: self.count }
            });

            this.collection.on('sync', function() { self.render() }, self.collection);
        },

        events: {
            'click a#nextPageBtn': 'onNextPage',
            'click a#prevPageBtn': 'onPrevPage',
            'click a#goToPageBtn': 'onGoToPage'
        },

        onNextPage: function (e) {
            e.preventDefault();

            this.collection.nextPage();
        },

        onPrevPage: function (e) {
            e.preventDefault();

            this.collection.prevPage();
        },

        onGoToPage: function(e) {
            var currentPage = this.$el.find(e.currentTarget).data("id");

            e.preventDefault();

            this.collection.goToPage(currentPage);
        },

        render: function () {
            this.$el.html(this.template({
                collection: this.collection.toJSON(),
                countPages: this.collection.countPages,
                helper    : helper }));

            return this;
        }
    });
});