'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/contacts/contacts.html'
], function (Backbone, _, UserModel, contactsTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(contactsTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #leaveMessage': 'leaveMessage'
        },

        leaveMessage : function(e) {
            var message;
            var phone;
            var email;
            var name;
            var user;

            e.preventDefault();

            message = this.$el.find('#message').val();
            phone   = this.$el.find('#phone').val();
            email   = this.$el.find('#email').val();
            name    = this.$el.find('#name').val();

            if (message && phone && email && name) {
                user = new UserModel({
                    message : message,
                    phone   : phone,
                    email   : email,
                    name    : name
                });

                user.urlRoot = 'lullaby/contacts';

                user.save(null, {
                    success: function (response, xhr) {
                        if (response.attributes.fail) {

                            // inform profile if some fails
                            alert(response.attributes.fail);
                        } else {

                            // inform profile of leaving message result
                            alert(response.attributes.success);
                            Backbone.history.navigate('lullaby/shop', {trigger: true});
                        }
                    },
                    error  : function (err, xhr) {
                        alert('Some error');
                    }
                });
            } else {
                alert('Please fill all fields in contact form');
            }
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});