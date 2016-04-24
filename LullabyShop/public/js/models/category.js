'use strict';

define(['backbone'],
    function(Backbone){
        var CategoryModel = Backbone.Model.extend({
            idAttribute: '_id',

            urlRoot: function(){
                return 'lullaby/category';
            }
        });

        return CategoryModel;
    }
);