'use strict';

var CommentModel = require('../models/Comment');
var ProductModel = require('../models/Product');
var UserModel    = require('../models/User');

var validator    = require('../helpers/validator')();

var ObjectId     = require('mongodb').ObjectID;
var async        = require('async');

var CommentHandler = function () {

    this.fetch = function (req, res, next) {
        CommentModel
            .find({}, {__v: 0})
            .lean()
            .exec(function (err, comments) {
                if (err) {

                    return next(err);
                }

                if (!comments) {

                    return res.status(404).send({fail: 'Not found'});
                }

                res.status(200).send(comments);
            });
    };

    this.count = function (req, res, next) {
        CommentModel
            .find({}, {__v: 0})
            .lean()
            .count(function (err, amount) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({count: amount});
            });
    };

    this.fetchById = function (req, res, next) {
        var commentId = req.params.id;

        if (!validator.isId(commentId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        CommentModel
            .find({_id: ObjectId(commentId)})
            .lean()
            .exec(function (err, comment) {
                if (err) {

                    return next(err);
                }

                if (!comment) {

                    return res.status(404).send({fail: 'Not found'});
                }

                res.status(200).send(comment);
            });
    };

    this.create = function (req, res, next) {
        var session = req.session || {};
        var body    = req.body    || {};
        var text    = body.text;
        var username = body.username;
        var product = body.product;
        var user  = session.userId || null;
        var pushCommentOpt;
        var comment;

        if (!validator.isFirstname(username) ||
            !validator.isText(text)        ||
            !validator.isId(product)) {

            return res.status(400).send({fail: 'Wrong incoming data'});
        }

        comment = new CommentModel({
            username: username,
            product : product,
            user    : user,
            text    : text
        });

        pushCommentOpt = { $push: { comments: comment._id }};

        async.parallel([
                function (callback) {
                    comment
                        .save(function (err, comment) {
                            return callback(err, comment)
                        });
                },
                function (callback) {
                    ProductModel
                        .find({ _id: ObjectId(product) }, pushCommentOpt)
                        .lean()
                        .exec(function (err, product) {
                            return callback(err, product);
                        });
                },
                function (callback) {
                    if (userId) {
                        UserModel
                            .find({ _id: ObjectId(userId) }, pushCommentOpt)
                            .lean()
                            .exec(function (err, user) {
                                return callback(err, user);
                            });
                    } else {

                        return callback(null);
                    }
                }
        ], function (err, result) {
                if (err) {

                    return next(err);
                }
                res.status(201).send({ success: 'Comment successfully created' });
            });
    };

    this.remove = function (req, res, next) {
        var commentId = req.params.id;

        if (!validator.isId(commentId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        async.parallel([
            function (callback) {
                CommentModel
                    .findByIdAndRemove(commentId)
                    .exec(function (err, result) {
                        return callback(err, result);
                    });
            },
            function (callback) {
                ProductModel
                    .update({}, {$pull: {comments: ObjectId(commentId)}})
                    .exec(function (err, result) {
                        return callback(err, result);
                    })
            }
        ], function (err, result) {
            if (err) {

                return next(err);
            }

            res.status(200).send({success: 'Comment successfully removed'});
        });
    };
};

module.exports = CommentHandler;
