'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/auth/authMenu.html'

], function (Backbone, _, authMenuTemplate) {
    var View = Backbone.View.extend({
        el      : "#authMenu",
        template: _.template(authMenuTemplate),

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});


