'use strict';

define([
    'backbone',
    'underscore',
    'views/search/search',
    'views/order/orderMenu',
    'views/product/productsList',
    'views/category/categoryList',
    'views/auth/authMenu',
    'text!templates/home.html'
], function (Backbone, _, SearchView, OrderMenuView, ProductListView, CategoriesView, AuthMenuView, homeTemplate) {
    var View = Backbone.View.extend({
            el      : "#content",
            template: _.template(homeTemplate),

            initialize: function () {
                var next = APP.nextView;

                this.render();

                if (this.orderMenuView) {
                    this.orderMenuView.undelegateEvents()
                }

                this.orderMenuView = new OrderMenuView();

                if (this.searchView) {
                    this.searchView.undelegateEvents()
                }

                this.searchView = new SearchView();

                if (this.categoriesView) {
                    this.categoriesView.undelegateEvents()
                }

                this.categoriesView = new CategoriesView();

                if (this.authMenuView) {
                    this.authMenuView.undelegateEvents()
                }

                this.authMenuView = new AuthMenuView();

                if (next) {

                    delete APP.nextView;
                    Backbone.history.navigate(next, {trigger: true});
                } else {
                    if (this.productView) {
                        this.productView.undelegateEvents()
                    }

                    this.productView = new ProductListView();
                }
            },

            render: function () {
                this.$el.html(this.template());

                return this;
            }
        });

    return View;
});