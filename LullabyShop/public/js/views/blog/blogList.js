'use strict';

define([
    'helper',
    'constant',
    'backbone',
    'validator',
    'underscore',
    'collections/blogs',
    'text!templates/blog/blogList.html'
], function (helper, constant, Backbone, validator, _, Collection, blogListTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(blogListTemplate),

        initialize: function (pageNumber) {
            var self   = this;
            this.page  = pageNumber;
            // use default amount topics for page = 4
            this.count = constant.pagination.TOPICS_PER_PAGE;

            this.collection = new Collection({
                reset: true,
                data : { page: self.page, count: self.count }
            });

            this.collection.on('sync', function() { self.render() }, self.collection);
            this.collection.on('sort', function() { self.render() }, self.collection);
        },

        events: {
            'click a#sortByTitleBtn': 'onSortByTitle',
            'click a#sortByDateBtn' : 'onSortByDate',
            'click a#goToPageBtn'       : 'onGoToPage',
            'click a#nextBtn'       : 'onNext',
            'click a#prevBtn'       : 'onPrev'
        },

        onSortByDate: function(e) {
            e.preventDefault();

            this.collection.sortByField('postedDate');
        },

        onSortByTitle: function(e) {
            e.preventDefault();

            this.collection.sortByField('title');
        },

        onNext: function (e) {
            e.preventDefault();

            this.collection.nextPage();
        },

        onPrev: function (e) {
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
                helper    : helper
            }));

            return this;
        }
    });
});