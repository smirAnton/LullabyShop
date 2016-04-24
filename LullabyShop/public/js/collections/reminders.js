'use strict';

define([
    'backbone',
    'models/reminder'
], function(Backbone, Reminder){
    var Reminders = Backbone.Collection.extend({
        model: Reminder,
        url  : '/lullaby/reminder'
    });

    return Reminders;
});