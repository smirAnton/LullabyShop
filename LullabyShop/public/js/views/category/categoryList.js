'use strict';

define([
    'backbone',
    'underscore',
    'models/category',
    'collections/categories',
    'text!templates/category/categoryList.html'
], function (Backbone, _, CategoryModel, CategoriesCollection, categoriesTemplate) {
    var View = Backbone.View.extend({
        el      : "#categories",
        template: _.template(categoriesTemplate),

        initialize: function () {
            var self = this;
            var categories;

            categories = new CategoriesCollection();
            categories.fetch({
                success: function() {
                    self.collection = categories;
                    self.render();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        render: function () {
            this.$el.html(this.template({categories: this.collection.toJSON()}));

            return this;
        }
    });

    return View;
});