'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/header/header.html'
], function (Backbone, _, headerTemplate) {
    var View = Backbone.View.extend({
        el      : "#header",
        template: _.template(headerTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #logoutBtn': 'onLogout'
        },

        onLogout: function (e) {
            var self = this;

            e.stopPropagation();
            e.preventDefault();

            APP.authorised = localStorage.getItem('loggedIn');
            if (!APP.authorised) {

                return alert('You should firstly login');
            }

            $.ajax({
                url    : '/logout',
                type   :'GET',
                success: function(response){
                    if (APP.mainView) {
                        APP.mainView.undelegateEvents();

                        delete APP.mainView;
                    }

                    localStorage.clear();

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
                case 401: // if email already subscribed
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


