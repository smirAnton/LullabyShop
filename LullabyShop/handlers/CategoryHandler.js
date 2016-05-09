'use strict';

var CategoryModel = require('../models/Category');
var ProductModel  = require('../models/Product');

var validator     = require('../helpers/validator')();
var constant      = require('../constants/magicNumbers');

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
        var query        = req.query             || {};
        var page         = parseInt(query.page)  || constant.FIRST_PAGE;
        var limit        = parseInt(query.count) || constant.AMOUNT_OF_PRODUCTS_PER_PAGE;
        var skip         = (page - 1) * limit;

        if (!validator.isId(categoryId)) {

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

        if (!validator.isEmptyString(title)) {

            return res.status(422).send({fail: 'Please, provide category title'});
        }

        new CategoryModel({title: title})
            .save(function (err, createdCategory) {
                if (err) {

                    return next(err);
                }

                res.status(201).send({success: 'Ctaegory successfully created'});
            });
    };

    this.update = function (req, res, next) {
        var categoryId = req.params.id;
        var body       = req.body || {};
        var title      = body.title;

        if (!validator.isId(categoryId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        if (!validator.isEmptyString(title)) {

            return res.status(422).send({fail: 'Please, provide category title'});
        }

        CategoryModel
            .findByIdAndUpdate(categoryId, {title: title}, {new: true})
            .exec(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'Category successfully updated'});
            });
    };

    this.remove = function (req, res, next) {
        var categoryId = req.params.id;

        if (!validator.isId(categoryId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        CategoryModel
            .findByIdAndRemove(categoryId)
            .exec(function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'Category successfully removed'});
            });
    };
};

module.exports = CategoryHandler;
