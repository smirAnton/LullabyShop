'use strict';

var CategoryModel = require('../models/Category');
var ProductModel  = require('../models/Product');

var validator     = require('validator');
var ObjectId      = require('mongodb').ObjectID;
var async         = require('async');

var ProductHandler = function () {

    this.fetch = function (req, res, next) {
        var query = req.query;
        var page  = query.page || 1;
        var limit = parseInt(query.count) || 12;
        var skip  = (page - 1) * limit;

        ProductModel
            .find({}, {__v: 0})
            .skip(skip)
            .limit(limit)
            .lean()
            .exec(function(err, products) {
                if (err) {

                    return next(err);
                }

                if (products) {

                    res.status(200).send(products);
                } else {
                    err = new Error('Not found products');
                    err.staus = 404;

                    return next(err);
                }
            });
    };

    this.count = function (req, res, next) {
        ProductModel
            .find({})
            .lean()
            .count(function (err, amount) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({amount : amount});
            });
    };

    this.fetchByIdWithComments = function (req, res, next) {
        var productId = req.params.id;
        var error;

        if (productId && validator.isMongoId(productId)) {
            ProductModel
                .aggregate(
                    [{
                        $match: {_id: ObjectId(productId) }
                    }, {
                        '$unwind'                 : '$comments'
                    }, {
                        '$lookup': {
                            from                  : 'comments',
                            foreignField          : '_id',
                            localField            : 'comments',
                            as                    : 'comments'}
                    }, {
                        '$project': {
                            _id                   : 1,
                            title                 : 1,
                            price                 : 1,
                            brand                 : 1,
                            productCode           : 1,
                            description           : 1,
                            mainImage             : 1,
                            searchImage           : 1,
                            detailImages          : 1,
                            comments              : {$arrayElemAt:['$comments', 0]}}
                    }, {
                        $group: {
                            _id: {
                                _id               : '$_id',
                                title             : '$title',
                                price             : '$price',
                                brand             : '$brand',
                                searchImage       : '$searchImage',
                                mainImage         : '$mainImage',
                                description       : '$description',
                                productCode       : '$productCode',
                                detailImages      : '$detailImages'},
                            comments: {
                                $push: {
                                    _id       : '$comments._id',
                                    user      : '$comments.user',
                                    text      : '$comments.text',
                                    postedDate: '$comments.postedDate',
                                    authorName: '$comments.authorName'}}}
                    }, {
                        $project: {
                            _id                   : '$_id._id',
                            title                 : '$_id.title',
                            price                 : '$_id.price',
                            brand                 : '$_id.brand',
                            description           : '$_id.description',
                            searchImage           : '$_id.searchImage',
                            mainImage             : '$_id.mainImage',
                            productCode           : '$_id.productCode',
                            comments              : 1}
                    }])
                .exec(function(err, product) {
                    if (err) {

                        return next(err);
                    }

                    if (product) {

                        res.status(200).send(product[0]);
                    } else {

                        res.status(200).send({fail : 'Not found such product'});
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
                .exec(function(err, product) {
                    if (err) {

                        return next(err);
                    }

                    if (product) {

                        res.status(200).send(product);
                    } else {

                        res.status(200).send({fail : 'Not found such product'});
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
                title      : title,
                price      : price,
                brand      : brand,
                description: description,
                category   : category
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
                res.status(201).send({success : 'created'});
            });
        } else {

            res.status(200).send({fail : 'Wrong incoming data. Please try again'});
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

                        res.status(200).send({success : 'updated'});
                    });
            } else {

                res.status(200).send({fail : 'Wrong incoming data. Please, try again'});
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

                    res.status(200).send({success : 'removed'});
                }
            );
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.removeAllWhereNotCategory = function(req, res, next) {
        ProductModel
            .remove({category : null}, function(err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success : 'removed'});
            })
    };

    this.search = function (req, res, next) {
        var query = req.query;
        var page  = query.page || 1;
        var limit = parseInt(query.count) || 12;
        var skip  = (page - 1) * limit;
        var title = query.word || '';
        var pattern;

        if (title) {
            // define regular expression for search
            pattern = new RegExp(title, 'i');
            //find out amount of products
            ProductModel
                .count({title: pattern}, function(err, count) {
                   if (err) {

                       return next(err);
                   }
                    // get part of products by search word
                    ProductModel
                        .find({title: pattern})
                        .skip(skip)
                        .limit(limit)
                        .lean()
                        .exec(function (err, products) {
                            if (err) {

                                return next(err);
                            }

                            if (products.length) {

                                products[0].count = count;
                            } else {

                                products = [];
                            }

                            res.status(200).send(products);
                        });
                });
        } else {

            res.status(200).send({fail : 'Nope...Please provide searching word'});
        }
    };
};

module.exports = ProductHandler;
