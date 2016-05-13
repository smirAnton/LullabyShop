'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/activation/activationChoice.html'
], function (Backbone, _, activationTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(activationTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #activateByMobileBtn': 'onActivateByMobile',
            'click #activateByMailBtn'  : 'onActivateByMail'
        },

        onActivateByMobile: function (e) {
            e.stopPropagation();
            e.preventDefault();

            $.ajax({
                url    : '/activate/mobile',
                type   :'GET',
                success: function(response){
                    APP.notification(response.success);
                    APP.navigate('#lullaby/activate/mobile');
                },
                error  : function(err){
                    APP.handleError(err);
                }
            });
        },

        onActivateByMail: function (e) {
            e.stopPropagation();
            e.preventDefault();

            $.ajax({
                url    : '/activate/mail',
                type   :'GET',
                success: function(response){
                    APP.notification(response.success);
                    APP.navigate('#lullaby/shop');
                },
                error  : function(err){
                    APP.handleError(err);
                }
            });
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});