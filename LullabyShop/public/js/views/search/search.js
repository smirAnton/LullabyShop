'use strict';

define([
    'backbone',
    'underscore',
    'collections/products',
    '../product/product',
    'text!templates/search/search.html'
], function (Backbone, _, Collection, ProductsListView, searchTemplate) {
    var View = Backbone.View.extend({
        el      : "#search",
        template: _.template(searchTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #searchBtn': 'onSearch'
        },

        onSearch: function(e) {
            var searchingWord;

            e.stopPropagation();
            e.preventDefault();

            searchingWord = this.$el.find('#search').val();
            this.$el.find('#search').val('');

            if (!searchingWord || !searchingWord.trim().length) {
                return alert('Please provide searching word');
            }

            Backbone.history.navigate('lullaby/search/' + searchingWord, {trigger: true});
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});


