'use strict';

var Subscriber = require('../models/Subscribers');

var validator = require('validator');

var SubscriberHandler = function () {

    this.join = function (req, res, next) {
        var body  = req.body || {};
        var email = body.email;

        if (!email || !validator.isEmail(email)) {

            return res.status(422).send({fail: 'Please provide email'})
        }


        Subscriber
            .findOne({email: email})
            .lean()
            .exec(function (err, subscriber) {
                if (err) {

                    return next(err);
                }

                if (subscriber) {

                    return res.status(409).send({fail: 'This email has already subscribed on Lullaby\'s newsletters'})
                }

                new Subscriber({email: email})
                    .save(function (err, result) {
                        if (err) {

                            return next(err);
                        }
                        res.status(201).send({success: 'You have successfully subscribed on Lullaby\'s newsletters'})
                    });

            });

    };
};

module.exports = SubscriberHandler;
