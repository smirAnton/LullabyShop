'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/activation/activationChoice.html'
], function (Backbone, _, activationTemplate) {
    var View = Backbone.View.extend({
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
            var self = this;
            e.stopPropagation();
            e.preventDefault();

            $.ajax({
                url    : '/activate/mobile',
                type   :'GET',
                success: function(response){
                    alert(response.success);
                    Backbone.history.navigate('#lullaby/activate/mobile', {trigger: true});
                },
                error  : function(xhr){
                    self.handleError(xhr);
                }
            });
        },

        onActivateByMail: function (e) {
            var self = this;
            e.stopPropagation();
            e.preventDefault();

            $.ajax({
                url    : '/activate/mail',
                type   :'GET',
                success: function(response){
                    alert(response.success);
                    Backbone.history.navigate('#lullaby/shop', {trigger: true});
                },
                error  : function(xhr){
                    self.handleError(xhr);
                }
            });
        },

        handleError: function(xhr) {
            switch (xhr.status) {
                case 403: // no user's data in session (login firstly)
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/login', {trigger: true});
                    break;

                case 404: // if user is not registered
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/register', {trigger: true});
                    break;

                case 409: // if user has already activated registration
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/login', {trigger: true});
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