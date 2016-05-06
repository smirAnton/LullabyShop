'use strict';

define([
    'backbone',
    'underscore',
    'models/category',
    'collections/categories',
    'text!templates/category/categoryList.html'
], function (Backbone, _, CategoryModel, CategoryCollection, categoriesTemplate) {
    var View = Backbone.View.extend({
        el      : "#categories",
        template: _.template(categoriesTemplate),

        initialize: function () {
            var self = this;

            this.collection = new CategoryCollection();
            this.collection.fetch({
                success: function() {
                    self.render();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        events: {
            'click #filterBtn': 'onFilter'
        },

        onFilter: function(e) {
            var selectedCategories;
            var query = '';
            var barrier;
            var index;

            e.stopPropagation();
            e.preventDefault();

            selectedCategories = $('input:checkbox:checked').map(function() {
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
            this.$el.html(this.template({categories: this.collection.toJSON()}));

            return this;
        }
    });

    return View;
});