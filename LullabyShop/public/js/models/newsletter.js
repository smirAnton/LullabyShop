'use strict';

define(['backbone'],
    function(Backbone){
        var NewsletterModel = Backbone.Model.extend({
            idAttribute: '_id',

            urlRoot: function(){
                return '/lullaby/newsletter';
            }
        });

        return NewsletterModel;
    }
);