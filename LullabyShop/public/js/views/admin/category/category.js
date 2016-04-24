'use strict';

define([
    'backbone',
    'underscore',
    'models/category',
    'collections/categories',
    'text!templates/admin/category/categoryList.html',
    'text!templates/admin/category/categoryEdit.html',
    'text!templates/admin/category/categoryCreate.html'
], function (Backbone, _, CategoryModel, CategoryCollection, categoryListTemplate, categoryEditTemplate, categoryCreateTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(categoryListTemplate),

        initialize: function () {
            var self = this;
            var categories;

            categories = new CategoryCollection();
            categories.fetch({
                success: function () {

                    self.collection = categories;
                    self.render();
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        events: {
            'click #removeBtn': 'remove',
            'click #cancelBtn': 'cancel',
            'click #createBtn': 'create',
            'click #updateBtn': 'update',
            'click #editBtn'  : 'edit',
            'click #addBtn'   : 'add'
        },

        remove: function(e) {
            var self = this;
            var categoryId;
            var category;

            e.stopPropagation();
            e.preventDefault();

            categoryId = $(e.currentTarget).data("id");
            if (!categoryId) {
                return alert('Impossible to remove this category');
            }

            category = self.collection.get(categoryId);
            category.destroy({
                success: function () {
                    alert('Category has removed');

                    self.template = _.template(categoryListTemplate);
                    self.initialize();
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        cancel: function(e) {
            e.stopPropagation();

            this.template = _.template(categoryListTemplate);
            this.initialize();
        },

        create: function(e) {
            var self = this;
            var category;
            var title;

            e.stopPropagation();
            e.preventDefault();

            title = this.$el.find('#title').val();

            if (!title || !title.trim().length) {
                return alert('Please provide category title')
            }

            category = new CategoryModel();
            category.save({title: title}, {
                success: function (response, xhr) {
                    alert('New category successfully added');

                    self.template = _.template(categoryListTemplate);
                    self.initialize();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        update: function (e) {
            var self = this;
            var category;
            var title;

            e.stopPropagation();
            e.preventDefault();

            title = this.$el.find('#title').val();

            if (!title || !title.trim().length) {
                return alert('Please provide category title')
            }

            category = self.model;
            category.save({title: title}, {
                success: function (response, xhr) {
                    self.template = _.template(categoryListTemplate);
                    self.initialize();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        edit: function (e) {
            var self = this;
            var categoryId;
            var category;

            e.stopPropagation();
            e.preventDefault();

            categoryId = $(e.currentTarget).data("id");
            if (!categoryId) {
                return alert('Impossible to update this category');
            }

            category = new CategoryModel({_id: categoryId});
            category.fetch({
                success: function () {
                    self.model = category;

                    self.template = _.template(categoryEditTemplate);
                    self.render();
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        add: function(e) {
            var self = this;

            e.stopPropagation();
            e.preventDefault();

            self.template = _.template(categoryCreateTemplate);
            self.render();
        },

        render: function () {
            this.$el.html(this.template({categories: this.collection.toJSON(), category: this.model}));

            return this;
        }
    });

    return View;
});
