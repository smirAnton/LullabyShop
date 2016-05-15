'use strict';

var UserModel = require('../models/User');

var validator = require('../helpers/validator')();
var imager    = require('../helpers/imager')();
var coder     = require('../helpers/coder')();

var UserHandler = function () {

    this.fetch = function (req, res, next) {
        UserModel
            .find({}, {_v: 0})
            .lean()
            .exec(function (err, users) {
                if (err) {

                    return next(err);
                }

                if (!users) {

                    return res.status(404).send({fail: 'Not found'});
                }

                res.status(200).send(users);
            });
    };

    this.count = function (req, res, next) {
        UserModel
            .find({})
            .lean()
            .count(function (err, amount) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({count: amount});
            });
    };

    this.fetchByIdWithOrders = function (req, res, next) {
        var userId = req.params.id;

        if (!validator.isId(userId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        UserModel
            .findById(userId)
            .populate('orders')
            .exec(function (err, user) {
                if (err) {

                    return next(err);
                }

                if (!user) {

                    return res.status(404).send({fail: 'Not found'});
                }

                res.status(200).send(user);
            });
    };

    this.update = function (req, res, next) {
        var userId    = req.params.id;
        var body      = req.body || {};
        var firstname = body.firstname;
        var password  = body.password;
        var birthday  = body.birthday;
        var surname   = body.surname;
        var gender    = body.gender;
        var street    = body.street;
        var phone     = body.phone;
        var email     = body.email;
        var city      = body.city;

        if (!validator.isId(userId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        if (!validator.isFirstname(firstname) &&
            !validator.isBirthday(birthday)   &&
            !validator.isPassword(password)   &&
            !validator.isSurname(surname)     &&
            !validator.isGender(gender)       &&
            !validator.isStreet(street)       &&
            !validator.isEmail(email)         &&
            !validator.isPhone(phone)         &&
            !validator.isCity(city)) {

            return res.status(422).send({fail: 'Wrong incoming data'});
        }

        if (password) {
            body.password = coder.encryptPassword(password);
        }

        UserModel
            .findByIdAndUpdate(userId, body)
            .exec(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'Successfully updated'});
            });
    };

    this.uploadAvatar = function (req, res, next) {
        var session = req.session || {};
        var userId  = session.userId;
        var imagePath;

        if (!validator.isId(userId)) {

            return res.status(401).send({fail: 'User not authorized'});
        }

        imager.uploadUserAvatar(req, function (err, path) {
            if (err) {

                return next(err);
            }
            // delete word public from path to image
            imagePath = path.substring(7);

            UserModel
                .findByIdAndUpdate(userId, {avatar: imagePath})
                .exec(function (err, result) {
                    if (err) {

                        return next(err);
                    }

                    res.status(200).send({success: 'Image uploaded'});
                })
        });

    };

    this.remove = function (req, res, next) {
        var session       = req.session || {};
        var userId        = req.params.id;
        var sessionUserId = session.userId;

        if (!validator.isId(userId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        if (!validator.isId(sessionUserId) || sessionUserId === userId) {

            return res.status(403).send({fail: 'You can\'t ban admin'});
        }

        UserModel
            .findByIdAndRemove(userId)
            .lean()
            .exec(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'User successfully removed'});
            });
    };

    this.changeBanStatus  = function (req, res, next) {
        var userId        = req.params.id;
        var session       = req.session || {};
        var sessionUserId = session.userId;

        if (!validator.isId(userId)) {

            return res.status(400).send({fail: 'Unknown user'});
        }

        if (!validator.isId(sessionUserId) || sessionUserId === userId) {

            return res.status(400).send({fail: 'You can\'t ban admin'});
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

    this.getUserDataForOrder = function(req, res, next) {
        var session       = req.session || {};
        var userId = session.userId;

        if (!validator.isId(userId)) {

            return res.status(400).send({fail: 'User is not authorized'});
        }

        UserModel
            .findById(userId, {firstname: 1, surname: 1, email: 1, phone: 1})
            .lean()
            .exec(function(err, userData) {
                if (err) {

                    return next(err);

                }

                res.status(200).send(userData);
            });
    }
};

module.exports = UserHandler;