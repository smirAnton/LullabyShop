'use strict';

define([
    'backbone',
    'underscore',
    'models/newsletter',
    'collections/newsletters',
    'text!templates/admin/newsletter/newsletterList.html',
    'text!templates/admin/newsletter/newsletterCreate.html'
], function (Backbone, _, NewsletterModel, NewsletterCollection, newsletterListTemplate, newsletterCreateTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(newsletterListTemplate),

        initialize: function () {
            var self = this;
            var newsletters;

            newsletters = new NewsletterCollection();
            newsletters.fetch({
                success: function () {
                    self.collection = newsletters;
                    self.render();
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        events: {
            'click #cancelBtn': 'cancel',
            'click #createBtn': 'create',
            'click #removeBtn': 'remove',
            'click #sendBtn'  : 'send'
        },

        cancel: function(e) {
            e.stopPropagation();
            e.stopPropagation();

            this.template = _.template(newsletterListTemplate);
            this.render();
        },

        remove: function(e) {
            var self = this;
            var newsletterId;
            var newsletter;

            e.stopPropagation();
            e.stopPropagation();

            newsletterId = $(e.currentTarget).data("id");

            if (!newsletterId) {
                return alert('Impossible to remove this newsletter');
            }

            newsletter = self.collection.get(newsletterId);
            newsletter.destroy({
                success: function (response) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('Newsletter has removed');
                        self.initialize();
                    }
                },
                error: function (err, xhr) {

                    alert(xhr.statusText);
                }
            });
        },

        create: function(e) {
            e.stopPropagation();
            e.stopPropagation();

            this.template = _.template(newsletterCreateTemplate);
            this.render();
        },

        send: function(e) {
            var self = this;
            var newsletter;
            var text;

            e.stopPropagation();
            e.preventDefault();

            text = this.$el.find('#text').val();

            if (!text) {
                return alert('Please provide newsletter text');
            }

            newsletter = new NewsletterModel();
            newsletter.save({text: text}, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert(response.attributes.success);

                        self.template = _.template(newsletterListTemplate);
                        self.initialize();
                    }
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        render: function () {
            this.$el.html(this.template({collection: this.collection.toJSON()}));

            return this;
        }
    });

    return View;
});
