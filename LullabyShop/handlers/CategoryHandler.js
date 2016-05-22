'use strict';

var CategoryModel = require('../models/Category');

var validator     = require('../helpers/validator')();

var CategoryHandler = function () {

    this.fetch = function (req, res, next) {
        CategoryModel
            .find({}, {_id: 1, title: 1})
            .lean()
            .exec(function (err, categories) {
                if (err) {

                    return next(err);
                }

                if (!categories) {

                    return res.status(404).send({ fail: 'Not found' });
                }

                res.status(200).send(categories);
            });
    };

    this.create = function (req, res, next) {
        var body  = req.body || {};
        var title = body.title;

        if (!validator.isEmptyString(title)) {

            return res.status(400).send({fail: 'Please, provide category title'});
        }

        new CategoryModel({ title: title })
            .save(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(201).send({success: 'Category successfully created'});
            });
    };

    this.update = function (req, res, next) {
        var categoryId = req.params.id;
        var body       = req.body || {};
        var title      = body.title;

        if (!validator.isId(categoryId)) {

            return res.status(400).send({ fail: 'Bad request' });
        }

        if (!validator.isEmptyString(title)) {

            return res.status(400).send({ fail: 'Please, provide category title' });
        }

        CategoryModel
            .findByIdAndUpdate(categoryId, { title: title }, { new: true })
            .lean()
            .exec(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({ success: 'Category successfully updated' });
            });
    };

    this.remove = function (req, res, next) {
        var categoryId = req.params.id;

        if (!validator.isId(categoryId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        CategoryModel
            .findByIdAndRemove(categoryId)
            .lean()
            .exec(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({ success: 'Category successfully removed' });
            });
    };
};

module.exports = CategoryHandler;
