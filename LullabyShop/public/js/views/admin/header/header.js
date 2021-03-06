'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/admin/header/header.html'
], function (Backbone, _, UserModel, headerTemplate) {
    var HeaderView = Backbone.View.extend({
        el      : "#header",
        template: _.template(headerTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #logoutBtn': 'onLogout'
        },

        onLogout: function(e) {
            var user;

            e.stopPropagation();
            e.preventDefault();

            user = new UserModel();
            user.urlRoot = '/logout';
            user.save(null, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('You successfully logout');
                        APP.authorised = false;
                        localStorage.clear();

                        if (APP.mainView) {

                            APP.mainView.undelegateEvents();
                            delete APP.mainView;
                        }

                        Backbone.history.navigate('#lullaby/main', {trigger: true});
                    }
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return HeaderView;
});


