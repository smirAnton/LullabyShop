'use strict';

define([
    'backbone',
    'underscore',
    'collections/categories',
    'text!templates/category/categoryList.html'
], function (Backbone, _, Collection, categoryListTemplate) {

    return Backbone.View.extend({
        el      : "#categories",
        template: _.template(categoryListTemplate),

        initialize: function () {
            var self = this;

            this.collection = new Collection();
            this.collection.fetch({
                success: function() {
                    self.render();
                },
                error: function(err, xhr) {
                    APP.handleError(xhr)
                }
            });
        },

        events: {
            'click #selectCategoryBtn': 'onSelectCategory',
            'click #selectFilterBtn'  : 'onSelectFilter',
            'click .globalSort'       : 'onSelectGlobalSort'
        },

        onSelectCategory: function (e) {
            var categoryId = this.$el.find(e.currentTarget).data('id');

            e.preventDefault();

            APP.channel.trigger('selectedCategory', { categoryId: categoryId });
        },

        onSelectFilter: function (e) {
            var self = this.$el;
            var selectedFilters = [ ];

            e.preventDefault();

            self.find('.checkbox input:checked').each(function() {
                selectedFilters.push(self.find(this).val());
            });
            
            APP.channel.trigger('selectedFilter', { filter: JSON.stringify(selectedFilters) });
        },

        onSelectGlobalSort: function (e) {
            var sortParam = this.$el.find(e.target).data('id');

            e.preventDefault();

            APP.channel.trigger('selectGlobalSort', { sortParam: sortParam })
        },

        render: function () {
            this.$el.html(this.template({
                collection: this.collection.toJSON() })
            );

            return this;
        }
    });
});