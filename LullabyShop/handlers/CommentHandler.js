'use strict';

var CommentModel = require('../models/Comment');
var ProductModel = require('../models/Product');
var UserModel    = require('../models/User');

var ObjectId     = require('mongodb').ObjectID;
var validator    = require('validator');
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

                res.status(200).send({amount: amount});
            });
    };

    this.fetchById = function (req, res, next) {
        var commentId = req.params.id;
        var error;

        if (commentId && validator.isMongoId(commentId)) {
            CommentModel
                .findById(commentId)
                .lean()
                .exec(function (err, comment) {
                    if (err) {

                        return next(err);
                    }

                    if (comment) {

                        res.status(200).send(comment);
                    } else {

                        res.status(200).send({fail: 'Not found such comment'});
                    }
                });
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.create = function (req, res, next) {
        var session = req.session || {};
        var body    = req.body || {};
        var authorName;
        var productId;
        var comment;
        var userId;
        var text;

        if (session.userId && validator.isMongoId(session.userId)) {
            userId = session.userId;
        }

        if (body.productId && validator.isMongoId(body.productId)) {
            productId = body.productId;
        }

        if (body.text && (typeof body.text === 'string') && body.text.trim().length) {
            text = body.text;
        }

        if (body.authorName && (typeof body.authorName === 'string') && body.authorName.trim().length) {
            authorName = body.authorName;
        }

        if (text && productId && authorName) {

            if (userId) {
                // create comment with auth author
                comment = new CommentModel({
                    authorName: authorName,
                    product   : productId,
                    user      : userId,
                    text      : text
                });

                // save comment in db, update product and user
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
                            UserModel
                                .findByIdAndUpdate(userId, {$push: {comments: comment._id}})
                                .exec(function (err, user) {
                                    return callback(err, user);
                                });
                        }],
                    function (err, result) {
                        if (err) {

                            return next(err);
                        }
                        res.status(201).send({success: 'created'});
                    });
            } else {
                // create comment with anonymous author
                comment = new CommentModel({
                    product: productId,
                    text   : text
                });

                // save comment in db and update product
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
                        }],
                    function (err, result) {
                        if (err) {

                            return next(err);
                        }
                        res.status(201).send({success: 'created'});
                    });
            }
        } else {

            res.status(200).send({fail: 'Please provide comment\'s text'});
        }
    };

    this.update = function (req, res, next) {
        var commentId = req.params.id;
        var body = req.body || {};
        var error;
        var text;

        if (commentId && validator.isMongoId(commentId)) {
            if (body.text && (typeof body.text === 'string') && body.text.trim().length) {
                text = body.text;
            }

            if (text) {
                CommentModel
                    .findByIdAndUpdate(commentId, {text: text}, {new: true})
                    .exec(function (err, result) {
                        if (err) {

                            return next(err);
                        }

                        res.status(200).send({success: 'updated'});
                    });

            } else {

                res.status(200).send({fail: 'Wrong incoming data. Please try again'});
            }
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.remove = function (req, res, next) {
        var commentId = req.params.id;
        var error;

        if (commentId && validator.isMongoId(commentId)) {
            async.parallel([
                    // delete comment from comments table
                    function (callback) {
                        CommentModel
                            .findByIdAndRemove(commentId)
                            .exec(function (err, result) {
                                return callback(err, result);
                            });
                    },
                    // delete comment from product's comments
                    function (callback) {
                        ProductModel
                            .update({}, {$pull: {comments: ObjectId(commentId)}})
                            .exec(function (err, result) {
                                return callback(err, result);
                            })
                    },
                    // delete comment from product's comments
                    function (callback) {
                        UserModel
                            .update({}, {$pull: {comments: ObjectId(commentId)}})
                            .exec(function (err, result) {
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

            return next(err);
        }
    };

    this.search = function (req, res, next) {
        var body = req.body || {};
        var searchingText;
        var pattern;

        if (body.text && (typeof body.text === 'string') && body.text.trim().length) {
            searchingText = body.text;
        }

        if (searchingText) {
            // define regular expression for search
            pattern = new RegExp(searchingText, 'i');

            CommentModel
                .find({text: {$regex: pattern}})
                .exec(function (err, comments) {
                    if (err) {

                        return next(err);
                    }

                    res.status(200).send(comments);
                });
        } else {

            res.status(200).send({fail: 'Wrong incoming data. Please try again'});
        }
    }
};

module.exports = CommentHandler;
