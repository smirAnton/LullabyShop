'use strict';

define([
    'backbone',
    'underscore',
    'models/category',
    'collections/categories',
    'text!templates/category/categoryList.html'
], function (Backbone, _, CategoryModel, Collection, categoriesTemplate) {
    var View = Backbone.View.extend({
        el      : "#categories",
        template: _.template(categoriesTemplate),

        initialize: function () {
            var self = this;

            this.collection = new Collection();
            this.collection.fetch({
                success: function() {
                    self.render();
                },
                error: function (err, xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        events: {
            'click #filterBtn'    : 'onFilter',
            'click #selectCategoryBtn': 'onSelectCategory'
        },

        onSelectCategory: function (e) {
            var categoryId  = this.$el.find(e.currentTarget).data("id");
            var navigateUrl = '#lullaby/shop/id=' + categoryId + '/p=1';

            e.preventDefault();

            Backbone.history.navigate(navigateUrl);
        },

        onFilter: function(e) {
            var selectedCategories;
            var query = '';
            var barrier;
            var index;

            e.stopPropagation();
            e.preventDefault();

            selectedCategories = this.$el.find('input:checkbox:checked').map(function() {
                return this.value;
            }).get();

            if (!selectedCategories.length) {

                return alert('Please select categories');
            }

            barrier = selectedCategories.length;
            for(index = barrier - 1; index >= 0; index -= 1) {
                query += selectedCategories[index];

                if (index !== 0) {
                    query += '&';
                }
            }

            Backbone.history.navigate('#lullaby/categories/' + query, {trigger: true});
        },

        render: function () {
            this.$el.html(this.template({
                collection: this.collection.toJSON()})
            );

            return this;
        }
    });

    return View;
});