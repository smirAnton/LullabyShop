'use strict';

var ReminderModel = require('../models/Reminder');
var UserModel     = require('../models/User');

var validator     = require('validator');
var ObjectId      = require('mongodb').ObjectID;
var async         = require('async');

var mailer        = require('../helpers/mailer')();


var NewsletterHandler = function () {

    this.sendReminderToPassiveUsers = function (req, res, next) {
        var body         = req.body || {};
        var reminderText = body.text;
        var limitDate    = body.limitDate;

        if (!reminderText || !limitDate || !(typeof body.text === 'string') || !body.text.trim().length || !validator.isDate(body.limitDate)) {

            return res.status(422).send({fail: 'Nope...Please provide reminder text and limit date'});
        }

        async.waterfall([
            function (callback) {
                new ReminderModel({text: reminderText, limitDate: limitDate})
                    .save(function (err, result) {
                        return callback(err, result)
                    });
            },
            function (result, callback) {
                UserModel
                    .find({lastVisit: {$lt: new Date(limitDate)}}, {_id: 0, email: 1})
                    .lean()
                    .exec(function (err, users) {
                        console.log(users);
                        return callback(err, users);
                    });
            },
            function (users, callback) {
                var length = users.length;
                var index;
                if (users.length > 0) {
                    // look up for subscribers
                    for (index = length - 1; index >= 0; index -= 1) {
                        // send reminder to passive users
                        mailer.sendReminder({
                            email: users[index].email,
                            text: reminderText
                        }, function (err, result) {
                            return callback(err, result)
                        });
                    }
                } else {
                    return callback(null);
                }
            }
        ], function (err, result) {
            if (err) {

                return next(err);
            }
            res.status(200).send({success: 'Reminder has successfully sent to all passive users'});
        });
    };

    this.fetch = function (req, res, next) {
        ReminderModel
            .find({})
            .lean()
            .exec(function (err, reminders) {
                if (err) {

                    return next(err);
                }

                res.status(200).send(reminders);
            });
    };

    this.remove = function (req, res, next) {
        var reminderId = req.params.id;

        if (!reminderId || !validator.isMongoId(reminderId)) {

            return res.status(400).send({fail: 'Bad request'})
        }

        ReminderModel
            .remove({_id: ObjectId(reminderId)}, function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'removed'});
            });
    };
};

module.exports = NewsletterHandler;
