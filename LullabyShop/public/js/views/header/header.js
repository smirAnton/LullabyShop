'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/header/header.html'
], function (Backbone, _, headerTemplate) {

    return Backbone.View.extend({
        el      : "#header",
        template: _.template(headerTemplate),

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});


