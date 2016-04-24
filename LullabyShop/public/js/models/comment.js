'use strict';

define(['backbone'],
    function(Backbone){
        var CommentModel = Backbone.Model.extend({
            idAttribute: '_id',

            urlRoot: function(){
                return 'lullaby/comment';
            }
        });

        return CommentModel;
    }
);