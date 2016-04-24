'use strict';

define([
    'backbone',
    'models/order'
], function(Backbone, Comment){
    var Orders = Backbone.Collection.extend({
        model: Comment,
        url  : '/lullaby/order'
    });

    return Orders;
});