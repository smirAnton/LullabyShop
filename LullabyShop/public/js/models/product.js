'use strict';

define(['backbone'],
    function(Backbone){
        var ProductModel = Backbone.Model.extend({
            idAttribute: '_id',

            urlRoot: function(){
                return '/lullaby/product';
            }
        });

        return ProductModel;
    }
);