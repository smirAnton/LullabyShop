'use strict';

var UserModel    = require('../models/User');
var CommentModel = require('../models/Comment');

var nodemailer   = require('nodemailer');
var validator    = require('validator');
var ObjectId     = require('mongodb').ObjectID;
var imager       = require('../helpers/imager');
var REGEXP       = require('../constants/regExp');
var coder        = require('../helpers/coder');
var async        = require('async');

var UserHandler = function () {

    this.fetch = function (req, res, next) {
        UserModel
            .find({}, {_v: 0})
            .lean()
            .exec(function (err, users) {
                if (err) {

                    return next(err);
                }

                if (users) {

                    res.status(200).send(users);
                } else {
                    err = new Error('Not found');
                    err.status = 404;

                    return next(err);
                }
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

    this.fetchById = function (req, res, next) {
        var userId = req.params.id;
        var error;

        if (userId && validator.isMongoId(userId)) {
            UserModel
                .findById(userId)
                .lean()
                .exec(function (err, user) {
                    if (err) {

                        return next(err);
                    }

                    if (user) {

                        res.status(200).send(user);
                    } else {

                        res.status(200).send({fail: 'Not found such profile'});
                    }
                });
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.fetchByIdWithComments = function (req, res, next) {
        var userId = req.params.id;

        if (userId && validator.isMongoId(userId)) {
            UserModel
                .aggregate(
                    [{
                        $match: {
                            _id                       : ObjectId(userId)}
                    }, {
                        $unwind: {
                            path                      : '$comments',
                            preserveNullAndEmptyArrays: true}
                    }, {
                        $lookup: {
                            from                      : 'comments',
                            foreignField              : '_id',
                            localField                : 'comments',
                            as                        : 'comments'}
                    }, {
                        $project: {
                            _id                       : 1,
                            firstname                 : 1,
                            surname                   : 1,
                            email                     : 1,
                            comments: {
                                $arrayElemAt          : ['$comments', 0]}
                        }
                    }, {
                        $group: {
                            _id: {
                                _id                   : '$_id',
                                firstname             : '$firstname',
                                surname               : '$surname',
                                email                 : '$email'},
                            comments: {
                                $push: {
                                    _id               : '$comments._id',
                                    title             : '$comments.text',
                                    price             : '$comments.postedDate'
                                }
                            }
                        }
                    }, {
                        $project: {
                            _id                       : '$_id._id',
                            firstname                 : '$_id.firstname',
                            surname                   : '$_id.surname',
                            email                     : '$_id.email',
                            comments                  : 1
                        }
                    }])
                .exec(function (err, user) {
                    if (err) {

                        return next(err);
                    }

                    if (user) {

                        res.status(200).send(user);
                    } else {
                        err = new Error('Not found');
                        err.status = 404;

                        return next(err);
                    }
                });
        }
    };

    this.update = function (req, res, next) {
        var userId = req.params.id;
        var body = req.body || {};
        var firstname;
        var password;
        var birthday;
        var surname;
        var gender;
        var street;
        var phone;
        var email;
        var error;
        var city;

        if (userId && validator.isMongoId(userId)) {

            if (body.firstname && (typeof body.firstname === 'string') && body.firstname.trim().length) {
                firstname = body.firstname;
            }

            if (body.surname && (typeof body.surname === 'string') && body.surname.trim().length) {
                surname = body.surname;
            }

            if (body.email && (typeof body.email === 'string') && validator.isEmail(body.email)) {
                email = body.email;
            }

            if (body.phone && (typeof body.phone === 'string') && body.phone.match(REGEXP.MOBILE_VALID)) {
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

            if (body.birthday) {
                birthday = body.birthday;
            }

            if (firstname || surname || email || phone || password || gender || city || street || birthday) {
                if (password) {
                    body.password = coder.encryptPassword(password);
                }

                UserModel
                    .findByIdAndUpdate(userId, body)
                    .exec(function (err, result) {
                        if (err) {

                            return next(err);
                        }

                        res.status(200).send({success: 'updated'});
                    });
            } else {

                res.status(200).send({fail: 'Wrong incoming data. Please, try again'});
            }
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.uploadAvatar = function (req, res, next) {
        var session = req.session || {};
        var imagePath;
        var userId;

        if (session.userId) {
            userId = session.userId;
        }

        if (userId) {
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
                        res.status(200).send('upload');
                    })
            });
        } else {

            res.status(200).send({fail: 'User not authorized'});
        }
    };

    this.remove = function (req, res, next) {
        var userId = req.params.id;
        var error;

        if (userId && validator.isMongoId(userId)) {
            async.parallel([
                    // delete profile from user table
                    function (callback) {
                        UserModel
                            .findByIdAndRemove(userId)
                            .lean()
                            .exec(function (err, result) {
                                return callback(err, result);
                            });
                    },
                    // delete all profile's comments from comments table
                    function (callback) {
                        CommentModel
                            .remove({user: ObjectId(userId)}, function (err, result) {
                                return callback(err, result);
                            })
                    }],
                function (err, result) {
                    if (err) {

                        return next(err);
                    }

                    res.status(200).send({success: 'removed'});
                });
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };
};

module.exports = UserHandler;
