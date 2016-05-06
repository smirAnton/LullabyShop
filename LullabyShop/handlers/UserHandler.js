'use strict';

var UserModel  = require('../models/User');

var validator  = require('validator');

var regExp     = require('../constants/regExp');
var imager     = require('../helpers/imager')();
var coder      = require('../helpers/coder')();

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
            .find({}, {_v: 0})
            .lean()
            .count(function (err, amount) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({amount: amount});
            });
    };

    this.fetchByIdWithOrders = function (req, res, next) {
        var userId = req.params.id;

        if (!userId || !validator.isMongoId(userId)) {

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
        var userId = req.params.id;
        var body   = req.body || {};
        var firstname;
        var password;
        var birthday;
        var surname;
        var gender;
        var street;
        var phone;
        var email;
        var city;

        if (!userId || !validator.isMongoId(userId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        if (body.firstname && (typeof body.firstname === 'string') && body.firstname.trim().length) {
            firstname = body.firstname;
        }

        if (body.surname && (typeof body.surname === 'string') && body.surname.trim().length) {
            surname = body.surname;
        }

        if (body.email && (typeof body.email === 'string') && validator.isEmail(body.email)) {
            email = body.email;
        }

        if (body.phone && (typeof body.phone === 'string') && body.phone.match(regExp.MOBILE_VALID)) {
            phone = body.phone;
        }

        if (body.password && (typeof body.password === 'string') && body.password.trim().length) {
            password = body.password;
        }

        if (body.gender && (typeof body.gender === 'string') && body.gender.trim().length) {
            gender = body.gender;
        }

        if (body.city && (typeof body.city === 'string') && body.city.trim().length) {
            city = body.city;
        }

        if (body.street && (typeof body.street === 'string') && body.street.trim().length) {
            street = body.street;
        }

        if (body.birthday && (typeof body.street === 'string') && body.birthday.trim().length) {
            birthday = body.birthday;
        }

        if (!firstname && !surname && !email && !phone && !password && !gender && !city && !street && !birthday) {

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

        if (!userId) {

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
        var session           = req.session || {};
        var userId            = req.params.id;
        var userIdFromSession = session.userId;

        if (!userId || !validator.isMongoId(userId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        if (!userIdFromSession || !validator.isMongoId(userIdFromSession) || (userIdFromSession === userId)) {

            return res.status(403).send({fail: 'You can\'t delete your account'});
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
};

module.exports = UserHandler;
