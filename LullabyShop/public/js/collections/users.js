'use strict';

define([
    'backbone',
    'models/user'
], function(Backbone, User){
    var Users = Backbone.Collection.extend({
        model: User,
        url  : '/lullaby/user'
    });

    return Users;
});