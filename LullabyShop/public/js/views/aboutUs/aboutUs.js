'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/aboutUs/aboutUs.html'
], function (Backbone, _, aboutUsTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(aboutUsTemplate),

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});