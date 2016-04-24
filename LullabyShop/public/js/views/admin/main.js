'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'views/admin/header/header',
    'text!templates/admin/main.html'
], function (Backbone, _, UserModel, HeaderView, mainTemplate) {
    var View = Backbone.View.extend({
        el      : "#content-holder",
        template: _.template(mainTemplate),

        initialize: function () {

            this.render();

            if (this.headerView) {
                this.headerView.undelegateEvents();
            }

            this.headerView = new HeaderView();
        },

        render: function () {
            this.$el.html(this.template());

            Backbone.history.navigate('#lullaby/admin/category', {trigger: true});

            return this;
        }
    });

    return View;
});
