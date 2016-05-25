'use strict';

define([
    'backbone',
    'underscore',
    'collections/categories',
    'text!templates/category/categoryList.html'
], function (Backbone, _, Collection, categoryTemplate) {

    return Backbone.View.extend({
        el      : "#categories",
        template: _.template(categoryTemplate),

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
            'click .selectGlobalSortBtn': 'onSelectGlobalSort',
            'click #selectCategoryBtn'  : 'onSelectCategory',
            'click #selectFilterBtn'    : 'onSelectFilter'
        },

        onSelectGlobalSort: function (e) {
            e.preventDefault();

            APP.channel.trigger('selectGlobalSort', {
                sortParam: this.$el.find(e.target).data('id')
            })
        },

        onSelectCategory: function (e) {
            e.preventDefault();

            APP.channel.trigger('selectCategory', {
                categoryId: this.$el.find(e.currentTarget).data('id')
            });
        },

        onSelectFilter: function (e) {
            var self = this.$el;
            var selectedFilters = [ ];

            e.preventDefault();

            self.find('.checkbox input:checked').each(function() {
                selectedFilters.push(self.find(this).val());
            });
            
            APP.channel.trigger('selectFilter', { filter: JSON.stringify(selectedFilters) });
        },

        render: function () {
            this.$el.html(this.template({ collection: this.collection.toJSON() }));

            return this;
        }
    });
});