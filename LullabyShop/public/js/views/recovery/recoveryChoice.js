'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/recovery/recoveryChoice.html'
], function (Backbone, _, UserModel, recoveryChoiceTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(recoveryChoiceTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #recoveryByMobileBtn': 'recoveryByMobile',
            'click #recoveryByMailBtn'  : 'recoveryByMail'
        },

        recoveryByMobile: function (e) {
            var self = this;

            e.stopPropagation();
            e.preventDefault();

            $.ajax({
                url    : '/recovery/mobile',
                type   :'GET',
                success: function(response){
                    alert(response.success);
                    Backbone.history.navigate('#lullaby/recovery/mobile', {trigger: true})
                },
                error  : function(xhr){
                    self.handleError(xhr);
                }
            });
        },

        recoveryByMail: function (e) {
            var self = this;

            e.stopPropagation();
            e.preventDefault();

            $.ajax({
                url    : '/recovery/mail',
                type   :'GET',
                success: function(response){
                    alert(response.success);
                    Backbone.history.navigate('#lullaby/shop', {trigger: true})
                },
                error  : function(xhr){
                    self.handleError(xhr);
                }
            });
        },

        handleError: function(xhr) {
            switch (xhr.status) {
                case 404: // email is not provided
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/recovery', {trigger: true});
                    break;

                default:
                    break;
            }
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});