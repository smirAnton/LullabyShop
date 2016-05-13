'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/recovery/recoveryChoice.html'
], function (Backbone, _, UserModel, recoveryChoiceTemplate) {

    return Backbone.View.extend({
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
            var navigateUrl = '#lullaby/recovery/mobile';
            var ajaxUrl     = '/recovery/mobile';

            e.preventDefault();

            sendAjax(ajaxUrl, navigateUrl);
        },

        recoveryByMail: function (e) {
            var navigateUrl = '#lullaby/shop';
            var ajaxUrl     = '/recovery/mail';

            e.preventDefault();

            sendAjax(ajaxUrl, navigateUrl);
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    function sendAjax(ajaxUrl, navigateUrl) {
        $.ajax({
            url    : ajaxUrl,
            type   :'GET',
            success: function(response){
                APP.notification(response.success);
                APP.navigate(navigateUrl);
            },
            error  : function(err){
                APP.handleError(err);
            }
        });
    }
});