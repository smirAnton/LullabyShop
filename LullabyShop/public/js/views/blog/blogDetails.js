'use strict';

define([
    'backbone',
    'underscore',
    'models/blog',
    'text!templates/blog/blogDetails.html'
], function (Backbone, _, BlogModel, blogTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(blogTemplate),

        initialize: function (blogId) {
            var self = this;

            new BlogModel({_id: blogId})
                .fetch({
                    success: function(response) {
                        self.model = response.toJSON();
                        self.render();
                    },
                    error: function (err, xhr) {
                        APP.handleError(xhr);
                    }
                });
        },

        render: function () {
            this.$el.html(this.template({ topic: this.model }));

            return this;
        }
    });
});