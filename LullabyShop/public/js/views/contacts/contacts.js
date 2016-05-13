'use strict';

define([
    'backbone',
    'underscore',
    'text!templates/contacts/contacts.html'
], function (Backbone, _, contactsTemplate) {
    var View = Backbone.View.extend({
        el: "#content",
        template: _.template(contactsTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #leaveMessageBtn': 'onLeaveMessage'
        },

        onLeaveMessage: function (e) {
            var message;
            var phone;
            var email;
            var name;

            e.stopPropagation();
            e.preventDefault();

            message = this.$el.find('#message').val();
            phone = this.$el.find('#phone').val();
            email = this.$el.find('#email').val();
            name = this.$el.find('#name').val();

            if (!message || !phone || !email || !name) {

                return alert('Please, fill all fields in contact form');
            }

            $.ajax({
                url: '/lullaby/contacts',
                type: 'POST',
                data: {
                    message: message,
                    phone: phone,
                    email: email,
                    name: name},
                success: function(response, xhr) {
                    alert(response.success);
                    Backbone.history.navigate('lullaby/shop', {trigger: true});
                },
                error: function(xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});