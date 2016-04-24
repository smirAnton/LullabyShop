'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/footer/footer.html'

], function (Backbone, _, UserModel, footerTemplate) {
    var FooterView;

    // define footer view
    FooterView = Backbone.View.extend({
        el      : "#footer",
        template: _.template(footerTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #join': 'join'
        },

        join : function(e) {
            var email;
            var user;

            e.stopPropagation();
            e.preventDefault();
            // get profile input data
            email = this.$el.find('#email').val();

            if (email) {
                // create profile and set him email for transferring to server side
                user = new UserModel({
                    email : email
                });

                user.urlRoot = 'lullaby/subscriber/join';

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
                alert('Please provide email');
            }
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return FooterView;
});


