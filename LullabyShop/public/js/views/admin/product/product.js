'use strict';

define([
    'backbone',
    'underscore',
    'models/product',
    'models/category',
    'collections/products',
    'collections/categories',
    'text!templates/admin/product/productList.html',
    'text!templates/admin/product/productEdit.html',
    'text!templates/admin/product/productCreate.html'
], function (Backbone, _, ProductModel, CategoryModel, ProductCollection, CategoryCollection, productListTemplate, productEditTemplate, productCreateTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(productListTemplate),

        initialize: function () {
            var self = this;
            var products;

            products = new ProductCollection();
            products.fetch({
                success: function () {
                    self.collection = products;
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
            var productId;
            var product;

            e.stopPropagation();
            e.preventDefault();

            productId = $(e.currentTarget).data("id");

            if (!productId) {
                return alert('Impossible to remove this product');
            }

            product = self.collection.get(productId);
            product.destroy({
                success: function () {
                    alert('Product has removed');

                    self.template = _.template(productListTemplate);
                    self.initialize();
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        cancel: function(e) {
            e.stopPropagation();

            this.template = _.template(productListTemplate);
            this.initialize();
        },

        create: function(e) {
            var self = this;
            var categoryTitle;
            var description;
            var categoryId;
            var product;
            var title;
            var price;
            var brand;

            e.stopPropagation();
            e.preventDefault();

            description   = this.$el.find('#description').val();
            categoryTitle = this.$el.find('#categoryId').val();
            price         = this.$el.find('#price').val();
            brand         = this.$el.find('#brand').val();
            title         = this.$el.find('#title').val();

            _.each(self.collection.models, function(category) {
                if (category.attributes.title === categoryTitle) {
                    categoryId = category.attributes._id;
                }
            });

            if (!title || !brand || !price || !description || !categoryId) {
                return alert('Please fill all form\'s fields')
            }

            product = new ProductModel();
            product.save({
                description: description,
                category   : categoryId,
                title      : title,
                brand      : brand,
                price      : price
            }, {
                success: function (response, xhr) {
                    alert('New product successfully added');

                    self.template = _.template(productListTemplate);
                    self.initialize();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        update: function (e) {
            var self = this;
            var description;
            var options;
            var product;
            var title;
            var price;
            var brand;

            e.stopPropagation();
            e.preventDefault();

            description   = this.$el.find('#description').val();
            price         = this.$el.find('#price').val();
            brand         = this.$el.find('#brand').val();
            title         = this.$el.find('#title').val();

            if (!title && !brand && !price && !description) {
                return alert('Please fill all form\'s fields')
            }

            options = {
                description: description,
                price      : price,
                brand      : brand,
                title      : title
            };

            product = self.model;
            product.save(options, {
                success: function (response, xhr) {
                    self.template = _.template(productListTemplate);
                    self.initialize();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        edit: function (e) {
            var self = this;
            var productId;
            var product;

            e.stopPropagation();
            e.preventDefault();

            productId = $(e.currentTarget).data("id");
            if (!productId) {
                return alert('Impossible to update this product');
            }

            product = new ProductModel({_id: productId});
            product.fetch({
                success: function () {
                    self.model = product;

                    self.template = _.template(productEditTemplate);
                    self.render();
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        add: function(e) {
            var self = this;
            var categories;

            e.stopPropagation();
            e.preventDefault();

            categories = new CategoryCollection();
            categories.fetch({
                success: function () {
                    self.collection = categories;

                    self.template = _.template(productCreateTemplate);
                    self.render();
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        render: function () {
            this.$el.html(this.template({items: this.collection.toJSON(), item: this.model}));

            return this;
        }
    });

    return View;
});
