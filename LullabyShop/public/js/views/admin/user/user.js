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
            'click #removeBtn': 'remove',
            'click #banBtn'   : 'banUser',
            'click #unbanBtn' : 'unbanUser'
        },

        remove: function(e) {
            var self = this;
            var userId;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userId = $(e.currentTarget).data("id");

            if (!userId) {
                return alert('Impossible to remove this user');
            }

            user = self.collection.get(userId);
            user.destroy({
                success: function () {
                    alert('User has removed');

                    self.initialize();
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        banUser: function(e) {
            var self = this;
            var userId;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userId = $(e.currentTarget).data("id");

            if (!userId) {
                return alert('Impossible to ban this user');
            }

            user = self.collection.get(userId);
            user.save({isBanned: true}, {
                success: function () {
                    alert('User has banned');

                    self.initialize();
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        unbanUser: function(e) {
            var self = this;
            var userId;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userId = $(e.currentTarget).data("id");

            if (!userId) {
                return alert('Impossible to ban this user');
            }

            user = self.collection.get(userId);
            user.save({isBanned: false}, {
                success: function () {
                    alert('User has unbanned');

                    self.initialize();
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
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
