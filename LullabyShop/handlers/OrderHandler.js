'use strict';

var OrderModel = require('../models/Order');
var ProductModel = require('../models/Product');
var UserModel = require('../models/User');

var validator = require('../helpers/validator')();
var ObjectId = require('mongodb').ObjectID;
var async = require('async');

var regExp = require('../constants/regExp');
var mailer = require('../helpers/mailer')();


var OrderHandler = function () {

    this.fetch = function (req, res, next) {
        OrderModel
            .find({}, {__v: 0})
            .lean()
            .exec(function (err, orders) {
                if (err) {

                    return next(err);
                }

                if (!orders) {

                    return res.status(404).send({fail: 'Not found'});
                }

                res.status(200).send(orders);
            });
    };

    this.count = function (req, res, next) {
        OrderModel
            .count({}, function (err, count) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({count: count});
            });
    };

    this.fetchById = function (req, res, next) {
        var orderId = req.params.id;

        if (!validator.isId(orderId)) {

            return res.status(400).send({fail: 'Bad request'});
        }

        OrderModel
            .find({_id: ObjectId(orderId)})
            .exec(function (err, order) {
                if (err) {

                    return next(err);
                }

                if (!order) {

                    return res.status(404).send({fail: 'Not found'});

                }

                res.status(200).send(order);
            });
    };

    this.create = function (req, res, next) {
        var session   = req.session || {};
        var body      = req.body || {};
        var userId    = session.userId;
        var firstname = body.firstname;
        var products  = body.products;
        var surname   = body.surname;
        var email     = body.email;
        var phone     = body.phone;
        var orderOptions;
        var order;

        if (!validator.isFirstname(firstname) ||
            !validator.isProducts(products)   ||
            !validator.isSurname(surname)     ||
            !validator.isEmail(email)         ||
            !validator.isPhone(phone)) {

            return res.status(422).send({fail: 'Please fill all form\'s fields'});
        }

        calculateTotalSum(products, function (err, totalSum) {
            if (err) {

                return next(err);
            }

            orderOptions = {
                firstname: firstname,
                totalSum : totalSum,
                products : products,
                surname  : surname,
                email    : email,
                phone    : phone
            };

            if (validator.isId(userId)) {
                orderOptions.user = userId;
            }

            order = new OrderModel(orderOptions);

            async.parallel([
                function (callback) {
                    order.save(function (err, result) {
                        return callback(err, result)
                    });
                },
                function (callback) {
                    if (userId) {
                        UserModel
                            .update({_id: ObjectId(userId)}, {$push: {orders: order._id}})
                            .exec(function (err, result) {
                                return callback(err, result);
                            });
                    } else {
                        return callback(null);
                    }
                },
                function (callback) {
                    mailer.sendOrderLetter({
                        email: email,
                        order: order.orderCode
                    }, function (err, result) {
                        return callback(err, result);
                    });
                }
            ], function (err, result) {
                if (err) {

                    return next(err);
                }
                res.status(201).send({success: 'Thank you for shopping. Please check email with order number'});
            });
        });
    };

    this.remove = function (req, res, next) {
        var orderId = req.params.id;

        if (!validator.isId(orderId)) {

            return res.status(400).send({fail: 'Bad request'});
        }
        async.waterfall([
                function (callback) {
                    OrderModel
                        .remove({_id: ObjectId(orderId)}, function (err, result) {
                            return callback(err, order);
                        });
                },
                function (callback) {
                    UserModel
                        .update({}, {$pull: {orders: ObjectId(orderId)}})
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
    };

    function calculateTotalSum(products, callback) {
        var totalSum = 0;

        ProductModel
            .find({_id: {$in: products}}, {_id: 1, price: 1}, function (err, productsFromDb) {
                var barrier = products.length;
                var limit = productsFromDb.length;
                var index;
                var step;

                if (err) {

                    return callback(err);
                }

                for (step = barrier - 1; step >= 0; step -= 1) {
                    for (index = limit - 1; index >= 0; index -= 1) {
                        if (products[step] == productsFromDb[index]._id) {
                            totalSum += productsFromDb[index].price;
                        }
                    }
                }

                return callback(null, totalSum);
            });
    }
};

module.exports = OrderHandler;
