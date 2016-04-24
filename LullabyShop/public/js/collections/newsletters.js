'use strict';

define([
    'backbone',
    'models/newsletter'
], function(Backbone, Newsletter){
    var Newsletters = Backbone.Collection.extend({
        model: Newsletter,
        url  : '/lullaby/newsletter'
    });

    return Newsletters;
});