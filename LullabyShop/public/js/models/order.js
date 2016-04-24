'use strict';

define(['backbone'],
    function(Backbone){
        var OrderModel = Backbone.Model.extend({
            idAttribute: '_id',

            urlRoot: function(){
                return '/lullaby/order';
            }
        });

        return OrderModel;
    }
);