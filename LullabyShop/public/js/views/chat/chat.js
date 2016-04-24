'use strict';

define([
    'socketio',
    'backbone',
    'underscore',
    'models/user',
    'text!templates/chat/chat.html'
], function (socketio, Backbone, _, UserModel, chatTemplate) {
    var View = Backbone.View.extend({
        el: "#content",
        template: _.template(chatTemplate),

        initialize: function () {
            var self = this;
            var userId = localStorage.getItem('userId');
            var io;

            if (!APP.io) {

                APP.io = socketio();
                io = APP.io;
            }

            // provide user id
            APP.io.emit('start', userId);

            APP.io.on('message', function (text) {
                self.$('#userMessage').before(
                    '<div class="left clearfix">' +
                        '<div class="chat-body clearfix">' +
                            '<div class="header">' +
                                '<strong class="primary-font">Anna</strong>'+
                                '<small class="pull-right text-muted"></small>' +
                            '</div>' +
                            '<p>' + text + '</p>' +
                        '</div>' +
                    '</div>');

            });

            this.render();
        },

        events: {
            'click #sendMessageBtn': 'onSendMessage'
        },

        onSendMessage: function (e) {
            var self = this;
            var message;
            var options;
            var name;

            e.stopPropagation();
            e.preventDefault();

            // user get message
            message = this.$el.find('#message').val();
            // clear input field
            this.$el.find('#message').val("");

            APP.io.emit('message', message);
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});