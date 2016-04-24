'use strict';

define(['backbone'],
    function(Backbone){
        var BlogModel = Backbone.Model.extend({
            idAttribute: '_id',

            urlRoot: function(){
                return '/lullaby/blog';
            }
        });

        return BlogModel;
    }
);