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

            APP.io.emit('start', userId);

            APP.io.on('message', this.appendMessage);

            this.render();
        },

        appendMessage: function (data) {
            var userName = localStorage.getItem('userFirstname') || 'Anonymous';

            if (data.label) {
                $('#userMessage').before(
                    '<div class="right clearfix">' +
                        '<div class="chat-body clearfix">' +
                            '<div class="header">' +
                                '<strong class="primary-font">' + userName + '</strong>'+
                                '<small class="pull-right text-muted"></small>' +
                            '</div>' +
                            '<p>' + data.message + '</p>' +
                        '</div>' +
                    '</div>')
            } else {
                $('#userMessage').before(
                    '<div class="left clearfix">' +
                        '<div class="chat-body clearfix">' +
                            '<div class="header">' +
                                '<strong class="primary-font">' + userName + '</strong>' +
                                '<small class="pull-right text-muted"></small>' +
                            '</div>' +
                            '<p>' + data.message + '</p>' +
                        '</div>' +
                    '</div>')
            }
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

            message = this.$el.find('#message').val();
            this.$el.find('#message').val("");

            APP.io.emit('message', {message: message}, this.appendMessage);
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});