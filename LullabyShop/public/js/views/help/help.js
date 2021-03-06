'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/help/help.html'
], function (Backbone, _, helpTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(helpTemplate),

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});