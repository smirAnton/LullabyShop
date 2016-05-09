'use strict';

var BlogModel = require('../models/Blog');

var validator = require('../helpers/validator')();
var constant  = require('../constants/magicNumbers');

var BlogHandler = function () {

    this.fetch = function (req, res, next) {
        var query = req.query;
        var limit = parseInt(query.count) || constant.AMOUNT_OF_TOPICS_PER_PAGE;
        var page  = parseInt(query.page)  || constant.FIRST_PAGE;
        var skip  = (page - 1) * limit;

        BlogModel
            .find({}, {__v: 0})
            .lean()
            .count(function (err, amount) {
                if (err) {

                    return next(err);
                }

                BlogModel
                    .find({}, {__v: 0})
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .exec(function (err, topics) {
                        if (err) {

                            return next(err);
                        }

                        if (!topics) {

                            return res.status(404).send({fail: 'Not found'})
                        }

                        topics[0] = topics[0] || {};
                        topics[0].count = amount;

                        res.status(200).send(topics);
                    });
            });
    };

    this.count = function (req, res, next) {
        BlogModel
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
        var topicId = req.params.id;

        if (!validator.isId(topicId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        BlogModel
            .findById(topicId)
            .lean()
            .exec(function (err, topic) {
                if (err) {

                    return next(err);
                }

                if (!topic) {

                    return res.status(404).send({fail: 'Not found'})
                }

                res.status(200).send(topic);
            });
    };

    this.create = function (req, res, next) {
        var body      = req.body || {};
        var briefInfo = body.briefInfo;
        var title     = body.title;
        var text      = body.text;
        var topic;

        if (!validator.isEmptyString(briefInfo) ||
            !validator.isEmptyString(title)     ||
            !validator.isEmptyString(text)) {

            return res.status(422).send({fail: 'Please fill all form\'s fields'});
        }

        topic = new BlogModel({
            briefInfo: briefInfo,
            title    : title,
            text     : text
        });

        topic.save(function (err, createdTopic) {
            if (err) {

                return next(err);
            }

            res.status(201).send({success: 'Topic successfully created'});
        });
    };

    this.update = function (req, res, next) {
        var topicId = req.params.id;
        var body = req.body || {};
        var briefInfo = body.briefInfo;
        var title = body.title;
        var text = body.text;

        if (!validator.isId(topicId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        if (!validator.isEmptyString(briefInfo) && !validator.isEmptyString(title) && !validator.isEmptyString(text)) {

            return res.status(422).send({fail: 'Please provide data for update'});
        }


        BlogModel
            .findByIdAndUpdate(topicId, body, {new: true})
            .exec(function (err, updatedTopic) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'Topic successfully updated'});
            });
    };

    this.remove = function (req, res, next) {
        var topicId = req.params.id;

        if (!validator.isId(topicId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        BlogModel
            .findByIdAndRemove(topicId)
            .exec(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'Topic successfully removed'});
            });
    };

    this.search = function (req, res, next) {
        var body = req.body || {};
        var search = body.text;
        var pattern;

        if (!validator.isEmptyString(search)) {

            return res.status(422).send({fail: 'Please provide searching text'});
        }

        pattern = new RegExp(search, 'i');

        BlogModel
            .find({text: {$regex: pattern}})
            .lean()
            .exec(function (err, topics) {
                if (err) {

                    return next(err);
                }

                res.status(200).send(topics);
            });
    };
};

module.exports = BlogHandler;
