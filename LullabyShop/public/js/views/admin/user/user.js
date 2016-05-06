'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'collections/users',
    'text!templates/admin/user/userList.html'
], function (Backbone, _, UserModel, UserCollection, userListTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(userListTemplate),

        initialize: function () {
            var self = this;
            var users;

            users = new UserCollection();
            users.fetch({
                success: function () {
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

        onRemove: function(e) {
            var self = this;
            var userId;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userId = $(e.currentTarget).data("id");

            if (!userId) {

                return alert('Impossible to remove this user. Absent userId');
            }

            user = self.collection.get(userId);
            user.destroy({
                success: function (model, response) {
                    if (response.fail) {
                        alert(response.fail)
                    } else {
                        alert(response.success);
                        self.initialize();
                    }
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        onChangeBanStatus: function(e) {
            var self = this;
            var userId;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userId = $(e.currentTarget).data("id");

            if (!userId) {

                return alert('Impossible to change ban status for this user. Absent userId');
            }

            $.ajax('admin/ban', {
                type:'POST',
                data: {userId: userId},
                success: function(response) {
                    if (response.fail) {
                        alert(response.fail);
                    } else {
                        alert(response.success);
                        self.initialize();
                    }
                },
                error: function(xhr) {
                    alert(xhr);
                }
            });
        },

        render: function () {
            this.$el.html(this.template({users: this.collection.toJSON()}));

            return this;
        }
    });

    return View;
});
