'use strict';

var CategoryModel = require('../models/Category');
var ProductModel  = require('../models/Product');

var validator     = require('validator');
var ObjectId      = require('mongodb').ObjectID;
var async         = require('async');

var constant      = require('../constants/magicNumbers');

var ProductHandler = function () {

    this.fetch = function (req, res, next) {
        var query = req.query;
        var limit = parseInt(query.count) || constant.PRODUCTS_PER_PAGE;
        var page  = parseInt(query.page)  || constant.DEFAULT_PAGE;
        var skip  = (page - 1) * limit;
        var options;
        var sort;

        if (query.sort === 'price') {
            sort = { 'price' : 1 };
        } else if (query.sort === 'date') {
            sort = { 'createdDate' : 1 };
        } else {
            sort = { 'title' : 1 };
        }

        options = {
            title      : 1,
            price      : 1,
            brand      : 1,
            searchImage: 1
        };

        async.parallel([
            function(callback) {
                ProductModel
                    .find({}, {_id: 1})
                    .lean()
                    .count(function (err, amount) {

                        return callback(err, amount)
                    });
            },
            function(callback) {
                console.log(sort);
                ProductModel
                    .find({}, options)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .exec(function (err, allProducts) {

                        return callback(err, allProducts);
                    });
            }
        ], function(err, result) {
            var amount   = result[0];
            var products = result[1];

            if (err) {

                return next(err);
            }

            products[0]        = products[0] || {};
            products[0].amount = amount      || 0;

            res.status(200).send(products);
        });
    };

    this.fetchByIdWithComments = function (req, res, next) {
        var productId = req.params.id;
        var error;

        if (productId && validator.isMongoId(productId)) {
            ProductModel
                .aggregate(
                    [{
                        $match: {_id: ObjectId(productId)}
                    }, {
                        '$unwind': '$comments'
                    }, {
                        '$lookup': {
                            from: 'comments',
                            foreignField: '_id',
                            localField: 'comments',
                            as: 'comments'
                        }
                    }, {
                        '$project': {
                            _id: 1,
                            title: 1,
                            price: 1,
                            brand: 1,
                            productCode: 1,
                            description: 1,
                            mainImage: 1,
                            searchImage: 1,
                            detailImages: 1,
                            comments: {$arrayElemAt: ['$comments', 0]}
                        }
                    }, {
                        $group: {
                            _id: {
                                _id: '$_id',
                                title: '$title',
                                price: '$price',
                                brand: '$brand',
                                searchImage: '$searchImage',
                                mainImage: '$mainImage',
                                description: '$description',
                                productCode: '$productCode',
                                detailImages: '$detailImages'
                            },
                            comments: {
                                $push: {
                                    _id: '$comments._id',
                                    user: '$comments.user',
                                    text: '$comments.text',
                                    postedDate: '$comments.postedDate',
                                    authorName: '$comments.authorName'
                                }
                            }
                        }
                    }, {
                        $project: {
                            _id: '$_id._id',
                            title: '$_id.title',
                            price: '$_id.price',
                            brand: '$_id.brand',
                            description: '$_id.description',
                            searchImage: '$_id.searchImage',
                            mainImage: '$_id.mainImage',
                            productCode: '$_id.productCode',
                            comments: 1
                        }
                    }])
                .exec(function (err, product) {
                    if (err) {

                        return next(err);
                    }

                    if (product) {

                        res.status(200).send(product[0]);
                    } else {

                        res.status(200).send({fail: 'Not found such product'});
                    }
                });
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.fetchById = function (req, res, next) {
        var productId = req.params.id;
        var error;

        if (productId && validator.isMongoId(productId)) {
            ProductModel
                .findOne({_id: ObjectId(productId)})
                .populate('comments')
                .exec(function (err, product) {
                    if (err) {

                        return next(err);
                    }

                    if (product) {

                        res.status(200).send(product);
                    } else {

                        res.status(200).send({fail: 'Not found such product'});
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
        var description;
        var category;
        var product;
        var title;
        var brand;
        var price;

        if (body.title && typeof body.title === 'string' && body.title.trim().length) {
            title = body.title;
        }

        if (body.price && parseInt(body.price) > 0) {
            price = body.price;
        }

        if (body.brand && typeof body.brand === 'string' && body.brand.trim().length) {
            brand = body.brand;
        }

        if (body.description && typeof body.description === 'string' && body.description.trim().length) {
            description = body.description;
        }

        if (body.category && validator.isMongoId(body.category)) {
            category = body.category;
        }

        if (title && price && brand && description && category) {
            product = new ProductModel({
                title: title,
                price: price,
                brand: brand,
                description: description,
                category: category
            });

            async.parallel([
                    function (callback) {
                        product.save(function (err, product) {
                            return callback(err, product);
                        });
                    },
                    function (callback) {
                        CategoryModel
                            .findByIdAndUpdate(category, {$push: {products: product._id}})
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
        } else {

            res.status(200).send({fail: 'Wrong incoming data. Please try again'});
        }
    };

    this.update = function (req, res, next) {
        var productId = req.params.id;
        var body = req.body || {};
        var production;
        var category;
        var error;
        var title;
        var price;

        if (productId && validator.isMongoId(productId)) {
            if (body.title && typeof body.title === 'string' && body.title.trim().length) {
                title = body.title;
            }

            if (body.price && typeof body.price === 'number' && body.price > 0) {
                price = body.price;
            }

            if (body.production && typeof body.production === 'string' && body.production.trim().length) {
                production = body.production;
            }

            if (body.category && validator.isMongoId(body.category)) {
                category = body.category;
            }

            if (title || production || category || price) {

                ProductModel
                    .update({_id: ObjectId(productId)}, body, {new: true})
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

    this.remove = function (req, res, next) {
        var productId = req.params.id;
        var error;

        if (productId && validator.isMongoId(productId)) {

            async.parallel([
                    // remove product from product
                    function (callback) {
                        ProductModel
                            .findByIdAndRemove(productId)
                            .lean()
                            .exec(function (err) {
                                return callback(err);
                            });
                    },
                    // remove product from category
                    function (callback) {
                        CategoryModel
                            .update({}, {$pull: {products: ObjectId(productId)}})
                            .exec(function (err, result) {
                                return callback(err, result);
                            });
                    }],
                function (err, result) {
                    if (err) {

                        return next(err);
                    }

                    res.status(200).send({success: 'removed'});
                }
            );
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.removeAllWhereNotCategory = function (req, res, next) {
        ProductModel
            .remove({category: null}, function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'removed'});
            })
    };

    this.search = function (req, res, next) {
        var searchWord        = req.params.word;
        var query             = req.query || {};
        var sortParam         = query.sort;
        var page              = parseInt(query.page) || 1;
        var limit             = parseInt(query.count) || 12;
        var skip              = (page - 1) * limit;
        var aggregateProducts = [];
        var aggregateCount    = [];
        var pattern;

        if (!searchWord) {

            return res.status(400).send({fail: 'Bad request'});
        }
        // define regular expression for search
        pattern = new RegExp(searchWord, 'i');

        aggregateCount.push(
            {$match: {$or: [{title: pattern}, {description: pattern}]}}
        );

        aggregateProducts.push(
            {$match: {$or: [{title: pattern}, {description: pattern}]}},
            {$skip : skip},
            {$limit: limit}
        );

        if (sortParam) {
            aggregateProducts.push({$sort: {sortParam: 1}});
        }

        ProductModel
            .aggregate(aggregateCount)
            .exec(function (err, count) {
                if (err) {

                    return next(err);
                }

                ProductModel
                    .aggregate(aggregateProducts)
                    .exec(function (err, products) {
                        if (err) {

                            return next(err);
                        }

                        products[0]       = products[0] || {};
                        products[0].count = count.length;

                        res.status(200).send(products);
                    });
            });
    };

    this.fetchByFilter = function (req, res, next) {
        var filter              = req.params.filter;
        var query               = req.query             || {};
        var page                = parseInt(query.page)  || 1;
        var limit               = parseInt(query.count) || 12;
        var skip                = (page - 1) * limit;

        var aggregateCategories = [];
        var aggregateProducts   = [];
        var aggregateCount      = [];
        var parsedFilter;
        var barrier;
        var index;

        if (!filter) {

            return res.status(400).send({fail: 'Bad request'});
        }

        parsedFilter = filter.split('&');
        barrier      = parsedFilter.length - 1;

        for(index = barrier; index >= 0; index -= 1) {
            aggregateCategories.push({category: ObjectId(parsedFilter[index])});
        }

        aggregateCount.push(
            {$match: {$or: aggregateCategories}}
        );

        aggregateProducts.push(
            {$match: {$or: aggregateCategories}},
            {$skip : skip},
            {$limit: limit}
        );

        ProductModel
            .aggregate(aggregateCount)
            .exec(function (err, count) {
                if (err) {

                    return next(err);
                }

                ProductModel
                    .aggregate(aggregateProducts)
                    .exec(function (err, products) {
                        if (err) {

                            return next(err);
                        }

                        products[0]       = products[0] || {};
                        products[0].count = count.length;

                        res.status(200).send(products);
                    });
            });
    };
};

module.exports = ProductHandler;
