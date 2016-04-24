'use strict';

var CategoryModel = require('../models/Category');
var ProductModel  = require('../models/Product');

var validator = require('validator');
var ObjectId = require('mongodb').ObjectID;
var async = require('async');

var CategoryHandler = function () {

    this.fetch = function (req, res, next) {
        CategoryModel
            .find({}, {__v: 0})
            .lean()
            .exec(function (err, categories) {
                if (err) {

                    return next(err);
                }

                if (categories) {

                    res.status(200).send(categories);
                } else {

                    res.status(200).send({fail: 'Not found any category'});
                }
            });
    };

    this.count = function (req, res, next) {
        CategoryModel
            .find({})
            .lean()
            .count(function (err, amount) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({amount: amount});
            });
    };

    this.countCategoryProducts = function (req, res, next) {
        var categoryId = req.params.id;
        var error;

        if (categoryId && validator.isMongoId(categoryId)) {
            CategoryModel
                .find({_id: ObjectId(categoryId)})
                .lean()
                .exec(function (err, category) {
                    if (err) {

                        return next(err);
                    }

                    res.status(200).send({count: category[0].products.length});
                });
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.fetchByIdWithProducts = function (req, res, next) {
        var categoryId   = req.params.id;
        var aggregateObj = [{$match: {category: ObjectId(categoryId)}}];
        var query        = req.query || {};
        var page         = parseInt(query.page) || 1;
        var limit        = parseInt(query.count) || 12;
        var skip         = (page - 1) * limit;
        var error;

        if (categoryId && validator.isMongoId(categoryId)) {
            aggregateObj.push(
                {$skip: skip},
                {$limit: limit}
            );

            ProductModel
                .aggregate(aggregateObj)
                .exec(function (err, products) {
                    if (err) {

                        return next(err);
                    }

                    return res.status(200).send(products);
                });
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.create = function (req, res, next) {
        var body = req.body || {};
        var title;

        if (body.title && (typeof body.title === 'string') && body.title.trim().length) {
            title = body.title;
        }

        if (title) {
            new CategoryModel({title: title})
                .save(function (err, result) {
                    if (err) {

                        return next(err);
                    }

                    res.status(201).send({success: 'created'});
                });
        } else {

            res.status(200).send({fail: 'Please provide category title'});
        }
    };

    this.update = function (req, res, next) {
        var categoryId = req.params.id;
        var body = req.body || {};
        var title;
        var error;

        if (categoryId && validator.isMongoId(categoryId)) {

            if (body.title && (typeof body.title === 'string') && body.title.trim().length) {
                title = body.title;
            }

            if (title) {
                CategoryModel
                    .findByIdAndUpdate(categoryId, {title: title}, {new: true})
                    .exec(function (err, result) {
                        if (err) {

                            return next(err);
                        }

                        res.status(200).send({success: 'updated'});
                    });
            } else {

                res.status(200).send({fail: 'Please provide new title'});
            }
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.remove = function (req, res, next) {
        var categoryId = req.params.id;
        var error;

        if (categoryId && validator.isMongoId(categoryId)) {
            CategoryModel
                .findByIdAndRemove(categoryId)
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
};

module.exports = CategoryHandler;
