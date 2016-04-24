'use strict';

define([
    'backbone',
    'constants',
    'underscore',
    'models/reminder',
    'collections/reminders',
    'text!templates/admin/reminder/reminderList.html',
    'text!templates/admin/reminder/reminderCreate.html'
], function (Backbone, Constant, _, ReminderModel, ReminderCollection, reminderListTemplate, reminderCreateTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(reminderListTemplate),

        initialize: function () {
            var self = this;
            var reminders;

            reminders = new ReminderCollection();
            reminders.fetch({
                success: function () {
                    self.collection = reminders;
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

            this.template = _.template(reminderListTemplate);
            this.render();
        },

        remove: function(e) {
            var self = this;
            var reminderId;
            var reminder;

            e.stopPropagation();
            e.stopPropagation();

            reminderId = $(e.currentTarget).data("id");

            if (!reminderId) {
                return alert('Impossible to remove this reminder');
            }

            reminder = self.collection.get(reminderId);
            reminder.destroy({
                success: function (response) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('Reminder has removed');
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

            this.template = _.template(reminderCreateTemplate);
            this.render();
        },

        send: function(e) {
            var self = this;
            var amountOfMonths;
            var limitDate;
            var reminder;
            var text;

            e.stopPropagation();
            e.preventDefault();

            amountOfMonths = parseInt(this.$el.find('#month').val());
            text           = this.$el.find('#text').val();

            if (!text) {
                return alert('Please provide reminder text');
            }

            // define limit date
            limitDate = new Date(new Date().getTime() - (Constant.ONE_MONTH * amountOfMonths));
            // define reminder and send it to passive users
            reminder = new ReminderModel();
            reminder.save({text: text, limitDate: limitDate}, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert(response.attributes.success);

                        self.template = _.template(reminderListTemplate);
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
