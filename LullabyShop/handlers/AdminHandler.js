'use strict';

var UserModel = require('../models/User');

var validator = require('validator');
var ObjectId  = require('mongodb').ObjectID;
var async     = require('async');


var AdminHandler = function () {

    this.changeBanStatus  = function (req, res, next) {
        var session       = req.session || {};
        var body          = req.body || {};
        var userIdSession = session.userId;
        var userId        = body.userId;

        if (!userId || !validator.isMongoId(userId)) {

            return res.status(200).send({fail: 'Wrong userId param'});
        }

        if (userIdSession && validator.isMongoId(userIdSession) && userIdSession === userId) {

            return res.status(200).send({fail: 'You can\'t ban yourself'});
        }

        // change user's ban status
        async.waterfall([
            function (callback) {
                UserModel
                    .findOne({_id: ObjectId(userId)})
                    .lean()
                    .exec(function (err, user) {
                        callback(err, user);
                    })
            },
            function (user, callback) {
                UserModel
                    .findByIdAndUpdate(userId, {isBanned: !user.isBanned})
                    .exec(function (err, result) {
                        callback(err, result);
                    });
            }

        ], function (err, result) {
            if (err) {

                return next(err);
            }

            res.status(200).send({success: 'User\'s isBanned status successfully changed'})
        });
    };
};

module.exports = AdminHandler;
