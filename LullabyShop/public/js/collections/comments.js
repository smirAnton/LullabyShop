'use strict';

define([
    'backbone',
    'models/comment'
], function(Backbone, Comment){
    var Comments = Backbone.Collection.extend({
        model: Comment,
        url  : '/lullaby/comment'
    });

    return Comments;
});