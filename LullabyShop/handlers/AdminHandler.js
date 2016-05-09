'use strict';

var UserModel = require('../models/User');

var validator = require('../helpers/validator')();

var AdminHandler = function () {

    this.changeBanStatus  = function (req, res, next) {
        var session       = req.session || {};
        var body          = req.body    || {};
        var sessionUserId = session.userId;
        var userId        = body.userId;

        if (!validator.isId(userId)) {

            return res.status(422).send({fail: 'Unknown user'});
        }

        if (!validator.isId(sessionUserId) || sessionUserId === userId) {

            return res.status(403).send({fail: 'You can\'t ban admin'});
        }

        UserModel
            .findById(userId)
            .lean()
            .exec(function(err, user) {
                if (err) {

                    return next(err);
                }

                UserModel
                    .findByIdAndUpdate(userId, {isBanned: !user.isBanned})
                    .exec(function (err, updatedUser) {
                        var responseAnswer;

                        if (err) {

                            return next(err);
                        }

                        responseAnswer = updatedUser.isBanned ? 'User is unbanned' : 'User is banned';
                        res.status(200).send({success: responseAnswer})
                    });
            });
    };
};

module.exports = AdminHandler;
