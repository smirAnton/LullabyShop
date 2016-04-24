'use strict';

define(['backbone'],
    function(Backbone){
        var ReminderModel = Backbone.Model.extend({
            idAttribute: '_id',

            urlRoot: function(){
                return '/lullaby/reminder';
            }
        });

        return ReminderModel;
    }
);