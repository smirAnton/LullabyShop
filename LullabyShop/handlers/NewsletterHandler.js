'use strict';

var SubscriberModel = require('../models/Subscribers');
var NewsletterModel = require('../models/Newsletter');

var validator       = require('validator');
var ObjectId        = require('mongodb').ObjectID;
var mailer          = require('../helpers/mailer')();
var async           = require('async');

var NewsletterHandler = function () {

    this.sendNewsletter = function (req, res, next) {
        var body = req.body || {};
        var newsletterText;

        if (body.text && (typeof body.text === 'string') && body.text.trim().length) {
            newsletterText = body.text;
        }

        if (newsletterText) {
            async.waterfall([
                function (callback) {
                    new NewsletterModel({text: newsletterText})
                        .save(function (err, result) {
                            return callback(err, result)
                        });
                },
                function (result, callback) {
                    SubscriberModel
                        .find({}, {_id: 0, email: 1})
                        .lean()
                        .exec(function (err, subscribers) {
                            return callback(err, subscribers);
                        });
                },
                function (subscribers, callback) {
                    var length = subscribers.length;
                    var index;
                    // look up for subscribers
                    for (index = length - 1; index >= 0; index -= 1) {
                        // send newsletter to every subscriber
                        mailer.sendNewsletter({
                            email: subscribers[index].email,
                            text: newsletterText
                        }, function (err, result) {
                            return callback(err, result)
                        });
                    }
                }
            ], function (err, result) {
                if (err) {

                    return next(err);
                }
                res.status(200).send({success: 'Newsletter has successfully sent to all subscribers'});
            });
        } else {

            res.status(200).send({fail: 'Nope...Please provide newsletter text'});
        }

    };

    this.fetch = function (req, res, next) {
        NewsletterModel
            .find({})
            .lean()
            .exec(function(err, newsletters) {
                if (err) {

                    return next(err);
                }

                res.status(200).send(newsletters);
            });
    };

    this.remove = function (req, res, next) {
        var newsletterId = req.params.id;
        var error;

        if (newsletterId && validator.isMongoId(newsletterId)) {
            NewsletterModel
                .remove({_id: ObjectId(newsletterId)}, function(err, result) {
                    if (err) {

                        return next(err);
                    }

                    res.status(200).send({success: 'removed'});
                });
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(err);
        }

    };
};

module.exports = NewsletterHandler;
