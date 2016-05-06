'use strict';

var CategoryModel = require('../models/Category');
var ProductModel  = require('../models/Product');

var validator     = require('validator');
var ObjectId      = require('mongodb').ObjectID;

var CategoryHandler = function () {

    this.fetch = function (req, res, next) {
        CategoryModel
            .find({}, {__v: 0})
            .lean()
            .exec(function (err, categories) {
                if (err) {

                    return next(err);
                }

                if (!categories) {

                    return res.status(404).send({fail: 'Not found'});
                }

                res.status(200).send(categories);
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

    this.fetchByIdWithProducts = function (req, res, next) {
        var categoryId   = req.params.id;
        var aggregateObj = [{$match: {category: ObjectId(categoryId)}}];
        var query        = req.query || {};
        var page         = parseInt(query.page) || 1;
        var limit        = parseInt(query.count) || 12;
        var skip         = (page - 1) * limit;

        if (!categoryId || !validator.isMongoId(categoryId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        aggregateObj.push(
            {$skip : skip},
            {$limit: limit}
        );

        CategoryModel
            .find({_id: ObjectId(categoryId)})
            .lean()
            .exec(function (err, category) {

                ProductModel
                    .aggregate(aggregateObj)
                    .exec(function (err, products) {
                        if (err) {

                            return next(err);
                        }

                        products[0]       = products[0] || {};
                        products[0].count = category[0].products.length;

                        return res.status(200).send(products);
                    });
            });
    };

    this.create = function (req, res, next) {
        var body  = req.body || {};
        var title = body.title;

        if (!title || !(typeof body.title === 'string') || !body.title.trim().length) {

            return res.status(422).send({fail: 'Nope...Please, provide category title'});
        }

        new CategoryModel({title: title})
            .save(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(201).send({success: 'created'});
            });
    };

    this.update = function (req, res, next) {
        var categoryId = req.params.id;
        var body       = req.body || {};
        var title      = body.title;

        if (!categoryId || !validator.isMongoId(categoryId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        if (!title || !(typeof body.title === 'string') || !body.title.trim().length) {

            return res.status(422).send({fail: 'Nope...Please, provide category title'});
        }

        CategoryModel
            .findByIdAndUpdate(categoryId, {title: title}, {new: true})
            .exec(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'updated'});
            });

    };

    this.remove = function (req, res, next) {
        var categoryId = req.params.id;

        if (!categoryId || !validator.isMongoId(categoryId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        CategoryModel
            .findByIdAndRemove(categoryId)
            .exec(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'removed'});
            });
    };
};

module.exports = CategoryHandler;
