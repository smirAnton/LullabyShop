'use strict';

var Subscriber = require('../models/Subscribers');

var validator  = require('validator');

var SubscriberHandler = function () {

    this.join = function (req, res, next) {
        var body = req.body || {};
        var email;

        if (body.email && (typeof body.email === 'string') &&  validator.isEmail(body.email)) {
            email = body.email;
        }

        if (email) {
            // Check if subscriber has already made subscribe
            Subscriber
                .findOne({email : email})
                .lean()
                .exec(function(err, subscriber) {
                    if (err) {

                        return next(err);
                    }

                    if (!subscriber) {
                        // create new newsletter's subscriber
                        new Subscriber({email: email})
                            .save(function (err, result) {
                                if (err) {

                                    return next(err);
                                }
                                res.status(201).send({success: 'You have successfully subscribed on Lullaby\'s newsletters'})
                            });
                    } else {

                        res.status(201).send({fail: 'Nope...You have already subscribed on Lullaby\'s newsletters'})
                    }
                });
        } else {

            res.status(200).send({fail: 'Nope...Please provide email'})
        }
    };
};

module.exports = SubscriberHandler;
