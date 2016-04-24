'use strict';

define([
    'backbone',
    'underscore',
    'models/blog',
    'collections/blogs',
    'text!templates/admin/blog/blogList.html',
    'text!templates/admin/blog/blogCreate.html'
], function (Backbone, _, BlogModel, BlogCollection, blogListTemplate, blogCreateTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(blogListTemplate),

        initialize: function () {
            var self = this;
            var collection;

            collection = new BlogCollection();
            collection.fetch({
                success: function () {
                    self.collection = collection;
                    self.render();
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        events: {
            'click #cancelBtn': 'onCancel',
            'click #createBtn': 'onCreate',
            'click #removeBtn': 'onRemove',
            'click #addBtn'   : 'onAdd'
        },

        onCancel: function(e) {
            e.stopPropagation();
            e.stopPropagation();

            this.template = _.template(blogListTemplate);
            this.render();
        },

        onRemove: function(e) {
            var self = this;
            var blogId;
            var blog;

            e.stopPropagation();
            e.stopPropagation();

            blogId = $(e.currentTarget).data("id");

            if (!blogId) {

                return alert('Impossible to remove this blog');
            }

            blog = self.collection.get(blogId);
            blog.destroy({
                success: function (response) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('Blog has removed');
                        self.initialize();
                    }
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        onCreate: function(e) {
            e.stopPropagation();
            e.stopPropagation();

            this.template = _.template(blogCreateTemplate);
            this.render();
        },

        onAdd: function(e) {
            var self = this;
            var briefInfo;
            var title;
            var blog;
            var text;

            e.stopPropagation();
            e.preventDefault();

            briefInfo = this.$el.find('#briefInfo').val();
            title     = this.$el.find('#title').val();
            text      = this.$el.find('#text').val();

            if (!text || !title || !briefInfo) {

                return alert('Please fill all form\'s fields');
            }

            blog = new BlogModel();
            blog.save({
                briefInfo: briefInfo,
                title    : title,
                text     : text}, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert(response.attributes.success);

                        self.template = _.template(blogListTemplate);
                        self.initialize();
                    }
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        render: function () {
            this.$el.html(this.template({collection: this.collection.toJSON()}));

            return this;
        }
    });

    return View;
});
