'use strict';

define([
    'backbone',
    'validator',
    'underscore',
    'text!templates/footer/footer.html'
], function (Backbone, validator, _, footerTemplate) {
    var View = Backbone.View.extend({
        el      : "#footer",
        template: _.template(footerTemplate),

        initialize: function () {
            this.render();
        },

        events: {
            'click #joinBtn': 'onJoin'
        },

        onJoin: function (e) {
            var self = this;
            var email;

            e.stopPropagation();
            e.preventDefault();

            email = this.$el.find('#email').val();

            if (!validator.validateEmail(email)) {

                return alert('Please provide email');
            }

            $.ajax({
                url    : '/lullaby/subscriber/join',
                method : 'POST',
                data   : {email: email},
                success: function (response) {
                    alert(response.success);
                    self.$el.find('#email').val('');
                },
                error  : function (xhr) {
                    self.handleError(xhr);
                }
            });
        },

        handleError: function(xhr) {
            var self = this;

            switch (xhr.status) {
                case 409: // email already subscribed
                    alert(xhr.responseJSON.fail);
                    self.$el.find('#email').val('');
                    break;

                case 422: // user did not provide email
                    alert(xhr.responseJSON.fail);
                    self.$el.find('#email').val('');
                    break;

                default:
                    break;
            }
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return View;
});


