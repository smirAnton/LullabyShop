'use strict';

define(['backbone'],
    function(Backbone){
        var UserModel = Backbone.Model.extend({
            idAttribute: '_id',

            urlRoot: function(){
                return 'lullaby/user';
            }
        });

        return UserModel;
    }
);