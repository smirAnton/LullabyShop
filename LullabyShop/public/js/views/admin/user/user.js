'use strict';

define([
    'backbone',
    'underscore',
    'collections/users',
    'text!templates/admin/user/userList.html'
], function (Backbone, _, UserCollection, userListTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(userListTemplate),

        initialize: function () {
            var self = this;
            var users;

            users = new UserCollection();
            users.fetch({
                success: function (users) {
                    self.collection = users;
                    self.render();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        events: {
            'click #changeBanStatusBtn': 'onChangeBanStatus',
            'click #removeUserBtn'     : 'onRemove'
        },

        onChangeBanStatus: function(e) {
            var self = this;
            var userId;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userId = $(e.currentTarget).data("id");
            if (!userId) {

                return alert('Unknown user');
            }

            $.ajax({
                url    : '/admin/ban',
                type   :'POST',
                data   : {userId: userId},
                success: function(response, xhr) {
                    alert(response.success);
                    self.initialize()
                },
                error  : function(xhr) {
                    self.handlerError(xhr);
                }
            });
        },

        onRemove: function(e) {
            var self = this;
            var userId;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userId = $(e.currentTarget).data("id");
            if (!userId) {

                return alert('Unknown user');
            }

            user = this.collection.get(userId);
            user.destroy({
                success: function (model, xhr) {
                    alert(xhr.success);
                    self.initialize();
                },
                error  : function (err, xhr) {
                    self.handlerError(xhr);
                }
            });
        },

        handlerError: function(xhr) {
            switch (xhr.status) {
                case 400: // bad request
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/admin', {trigger: true});
                    break;

                case 403: // can not ban admin
                    alert(xhr.responseJSON.fail);
                    break;

                case 404: // not found users or such user
                    alert(xhr.responseJSON.fail);
                    break;

                case 422: // unknown user
                    alert(xhr.responseJSON.fail);
                    break;

                default:
                    break;
            }
        },

        render: function () {
            this.$el.html(this.template({users: this.collection.toJSON()}));

            return this;
        }
    });

    return View;
});
