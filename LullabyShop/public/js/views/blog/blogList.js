'use strict';

define([
    'backbone',
    'constants',
    'underscore',
    'collections/blogs',
    'text!templates/blog/blogList.html'
], function (Backbone, constant, _, BlogCollection, blogListTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(blogListTemplate),

        initialize: function (options) {
            var self = this;
            var count;
            var page;

            options = options       || {};
            page    = options.page  || constant.FIRST_PAGE;
            count   = options.count || constant.AMOUNT_OF_TOPICS_PER_PAGE;

            this.collection = new BlogCollection({
                reset     : true,
                data: {
                    page  : page,
                    count : count
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

    return View;
});