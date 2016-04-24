'use strict';

define([
    'backbone',
    'underscore',
    'models/blog',
    'text!templates/blog/blogDetails.html'
], function (Backbone, _, BlogModel, blogTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(blogTemplate),

        initialize: function (blogId) {
            var self = this;
            var blog;

            blog = new BlogModel({_id: blogId});
            blog.fetch({
                success: function() {
                    self.model = blog;
                    self.render();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        render: function () {
            this.$el.html(this.template({blog : this.model.attributes}));

            return this;
        }
    });

    return View;
});