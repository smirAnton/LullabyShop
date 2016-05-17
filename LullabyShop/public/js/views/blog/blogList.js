'use strict';

define([
    'constant',
    'backbone',
    'underscore',
    'collections/blogs',
    'text!templates/blog/blogList.html'
], function (constant, Backbone, _, BlogCollection, blogListTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(blogListTemplate),

        initialize: function (pageNumber) {
            var self      = this;
            var paginData = constant.pagination;
            var count;
            var page;

            page  = pageNumber || 1;
            count = paginData.TOPICS_PER_PAGE;

            this.collection = new BlogCollection({
                reset: true,
                data : {
                    page : page,
                    count: count
                }
            });

            this.collection.on('sync', function() {
                self.countTopics = self.collection.countTopics;
                self.countPages  = self.collection.countPages;
                self.render();}, self.collection);

            this.collection.on('sort', function() {self.render()}, self.collection);
        },

        events: {
            'click a#sortByTitleBtn': 'onSortByTitle',
            'click a#sortByDateBtn' : 'onSortByDate',
            'click a#nextBtn'       : 'onNext',
            'click a#prevBtn'       : 'onPrev',
            'click a#goToBtn'       : 'onGoToPage'
        },

        onSortByDate: function(e) {
            e.stopPropagation();
            e.preventDefault();

            this.collection.sortByField('postedDate');
        },

        onSortByTitle: function(e) {
            e.stopPropagation();
            e.preventDefault();

            this.collection.sortByField('title');
        },

        onNext: function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.collection.nextPage();
        },

        onPrev: function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.collection.prevPage();
        },

        onGoToPage: function(e) {
            var page;

            e.stopPropagation();
            e.preventDefault();

            page = $(e.currentTarget).data("id");
            this.collection.goToPage(page);
            Backbone.history.navigate('#lullaby/blog/p=' + page);
        },

        render: function () {
            this.$el.html(this.template({
                countPages : this.countPages,
                blogs      : this.collection.toJSON(),
                count      : this.countPages
            }));

            return this;
        }
    });
});