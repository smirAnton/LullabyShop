'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/header/header.html'
], function (Backbone, _, headerTemplate) {

    return Backbone.View.extend({
        el      : "#header",
        template: _.template(headerTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #logoutBtn': 'onLogout'
        },

        onLogout: function (e) {
            e.preventDefault();

            //if (!APP.session.loggedIn) {
            //
            //    return APP.notification('You should firstly login');
            //}

            $.ajax({
                url    : '/logout',
                type   :'GET',
                success: function(response){
                    if (APP.mainView) {
                        APP.mainView.undelegateEvents();

                        delete APP.mainView;
                    }

                    delete APP.session;

                    APP.notification(response.success);
                    Backbone.history.navigate('#lullaby/shop', {trigger: true});
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


