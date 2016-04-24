'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'views/header/header',
    'views/footer/footer',
    'views/home',
    'text!templates/main.html'
], function (Backbone, _, UserModel, HeaderView, FooterView, HomeView, mainTemplate) {
    var View = Backbone.View.extend({
        el      : "#content-holder",
        template: _.template(mainTemplate),

        initialize: function () {
            var next = APP.next;

            this.render();

            if (this.headerView) {
                this.headerView.undelegateEvents()
            }

            this.headerView = new HeaderView();

            if (this.footerView) {
                this.footerView.undelegateEvents()
            }

            this.footerView = new FooterView();

            if (next) {

                delete APP.next;
                Backbone.history.navigate(next, {trigger: true});
            } else {
                if (this.homeView) {
                    this.homeView.undelegateEvents()
                }

                this.homeView = new HomeView();
            }
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});
