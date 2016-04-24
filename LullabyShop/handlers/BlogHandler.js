'use strict';

var BlogModel = require('../models/Blog');
var validator = require('validator');

var BlogHandler = function () {

    this.fetch = function (req, res, next) {
        var query = req.query;
        var page  = query.page || 1;
        var limit = parseInt(query.count) || 4;
        var skip  = (page - 1) * limit;

        BlogModel
            .find({}, {__v: 0})
            .sort({postedDate: -1})
            .skip(skip)
            .limit(limit)
            .lean()
            .exec(function (err, blogTopics) {
                if (err) {

                    return next(err);
                }

            res.status(200).send(blogTopics);
        });
    };

    this.count = function (req, res, next) {
        BlogModel
            .find({}, {__v: 0})
            .lean()
            .count(function (err, amount) {
                if (err) {

                    return next(err);
                } else {

                    res.status(200).send({amount: amount});
                }
            });
    };

    this.fetchById = function (req, res, next) {
        var topicId = req.params.id;
        var error;

        if (topicId && validator.isMongoId(topicId)) {
            BlogModel
                .findById(topicId)
                .lean()
                .exec(function (err, topic) {
                    if (err) {

                        return next(err);
                    }

                    if (topic) {

                        res.status(200).send(topic);
                    } else {

                        res.status(200).send({fail: 'Not found such topic'});
                    }
                });
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.create = function (req, res, next) {
        var body = req.body || {};
        var briefInfo;
        var title;
        var text;

        if (body.text && (typeof body.text === 'string') && body.text.trim().length) {
            text = body.text;
        }

        if (body.title && (typeof body.title === 'string') && body.title.trim().length) {
            title = body.title;
        }

        if (body.briefInfo && (typeof body.briefInfo === 'string') && body.briefInfo.trim().length) {
            briefInfo = body.briefInfo;
        }

        if (briefInfo && text && title) {
            new BlogModel({
                briefInfo: briefInfo,
                title    : title,
                text     : text
            }).save(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(201).send({success: 'created'});
            });
        } else {

            res.status(200).send({fail: 'Please fill all form\'s fields'});
        }
    };

    this.update = function (req, res, next) {
        var topicId = req.params.id;
        var body = req.body || {};
        var topicText;
        var error;

        if (topicId && validator.isMongoId(topicId)) {

            if (body.text && typeof body.text === 'string' && body.text.trim().length) {
                topicText = body.text;
            }

            if (topicText) {
                BlogModel
                    .findByIdAndUpdate(topicId, {text: topicText}, {new: true})
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
        var topicId = req.params.id;
        var error;

        if (topicId && validator.isMongoId(topicId)) {
            BlogModel
                .findByIdAndRemove(topicId)
                .exec(function (err, result) {
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

    this.search = function (req, res, next) {
        var body = req.body || {};
        var searchingText;
        var pattern;

        if (body.text && typeof body.text === 'string' && body.text.trim().length) {
            searchingText = body.text;
        }

        if (searchingText) {
            // Define regular expression for search
            pattern = new RegExp(searchingText, 'i');

            BlogModel
                .find({text: {$regex: pattern}})
                .lean()
                .exec(function (err, topics) {
                    if (err) {

                        return next(err);
                    }

                    res.status(200).send(topics);
                });
        } else {

            res.status(200).send({fail: 'Wrong incoming data. Please, try again'});
        }
    };
};

module.exports = BlogHandler;
