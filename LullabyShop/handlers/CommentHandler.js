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
        var commentOptions = {};
        var session        = req.session      || {};
        var body           = req.body         || {};
        var userId         = session.userId;
        var authorName     = body.username;
        var productId      = body.productId;
        var commentText    = body.commentText;
        var comment;

        if (!validator.isFirstname(authorName)    ||
            !validator.isEmptyString(commentText) ||
            !validator.isId(productId)) {

            return res.status(422).send({fail: 'Wrong incoming data'});
        }

        commentOptions = {
            authorName: authorName,
            product   : productId,
            text      : commentText
        };

        if (validator.isId(userId)) {
            commentOptions.user = userId;
        }

        comment = new CommentModel(commentOptions);

        async.parallel([
                function (callback) {
                    comment.save(function (err, createdComment) {
                        return callback(err, createdComment)
                    });
                },
                function (callback) {
                    ProductModel
                        .findByIdAndUpdate(productId, {$push: {comments: comment._id}})
                        .exec(function (err, category) {
                            return callback(err, category);
                        });
                },
                function (callback) {
                    if (userId) {
                        UserModel
                            .findByIdAndUpdate(userId, {$push: {comments: comment._id}})
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
                res.status(201).send({success: 'Comment successfully created'});
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
