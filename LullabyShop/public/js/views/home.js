'use strict';

define([
    'backbone',
    'underscore',
    'collections/products',
    'views/search/search',
    'views/order/orderMenu',
    'views/category/categoryList',
    'views/product/productsList',
    'views/auth/authMenu',
    'text!templates/home.html'
], function (Backbone, _, ProductCollection, SearchView, OrderMenuView, CategoryListView, ProductListView, AuthMenuView, homeTemplate) {
    return Backbone.View.extend({
        el: "#content",
        template: _.template(homeTemplate),

        initialize: function (page) {
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

            if (this.authMenuView) {
                this.authMenuView.undelegateEvents()
            }

            this.authMenuView = new AuthMenuView();

            if (this.categoryListView) {
                this.categoryListView.undelegateEvents()
            }

            this.categoryListView = new CategoryListView();

            if (next) {
                delete APP.nextView;
                Backbone.history.navigate(next, {trigger: true});

            } else {

                if (this.productView) {
                    this.productView.undelegateEvents()
                }

                this.productView = new ProductListView(page);
            }
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});