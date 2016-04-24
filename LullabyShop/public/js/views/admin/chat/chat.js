'use strict';

define([
    'socketio',
    'backbone',
    'underscore',
    'models/user',
    'text!templates/admin/chat/chat.html'
], function (socketio, Backbone, _, UserModel, chatTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(chatTemplate),

        initialize: function () {
            var userId = localStorage.getItem('userId');

            if (!APP.io) {

                APP.io = socketio();
            }
            // provide user id
            APP.io.emit('start', userId);

            this.render();
        },

        events: {
            'click #sendMessageBtn': 'onSendMessage'
        },

        onSendMessage: function (e) {

        },

        showMessage: function () {

        },


        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});