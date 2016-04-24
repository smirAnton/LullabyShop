'use strict';

define([
    'backbone',
    'underscore',
    'collections/blogs',
    'text!templates/blog/blogList.html'
], function (Backbone, _, BlogCollection, blogListTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(blogListTemplate),

        initialize: function () {
            var self = this;

            this.collection = new BlogCollection();
            // listen reset event
            this.collection.on('reset', function() {
                self.countBlogs = self.collection.countBlogs;
                self.countPages = self.collection.countPages;
                self.render()}, this);
            // listen sort event
            this.collection.on('sort', function() {self.render()}, this);
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
        },

        render: function () {
            this.$el.html(this.template({blogs : this.collection.toJSON(), count: this.countPages}));

            return this;
        }
    });

    return View;
});