'use strict';

var UserModel    = require('../models/User');
var validator    = require('validator');
var NUMBER       = require('../constants/magicNumbers');


var AdminHandler = function () {

    function changeBanStatus(userId, options, callback) {
        UserModel
            .findByIdAndUpdate(userId, options)
            .lean()
            .exec(function (err, result) {
                if (err) {

                    return callback(err);
                }

                callback(null, result);
            });
    }

    this.banUser = function (req, res, next) {
        var body = req.body || {};

        if (body.userId && validator.isMongoId(body.userId)) {
            changeBanStatus(body.userId, {isBanned : true}, function(err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'profile is banned'});
            })
        } else {

            res.status(200).send({fail: 'Wrong incoming data. Please try again'});
        }
    };

    this.unbanUser = function (req, res, next) {
        var body = req.body || {};

        if (body.userId && validator.isMongoId(body.userId)) {
            changeBanStatus(body.userId, {isBanned : false}, function(err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'profile is banned'});
            })
        } else {

            res.status(200).send({fail: 'Wrong incoming data. Please try again'});
        }
    };
};

module.exports = AdminHandler;
