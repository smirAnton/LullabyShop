'use strict';

var OrderModel = require('../models/Order');
var UserModel  = require('../models/User');

var validator  = require('validator');
var ObjectId   = require('mongodb').ObjectID;
var async      = require('async');
var REGEX      = require('../constants/regExp');
var mailer     = require('../helpers/mailer');

var OrderHandler = function () {

    this.fetch = function (req, res, next) {
        OrderModel
            .find({}, {__v: 0})
            .lean()
            .exec(function (err, orders) {
                if (err) {

                    return next(err);
                }

                if (orders) {

                    res.status(200).send(orders);
                } else {

                    res.status(200).send({fail : 'Not found any order'});
                }
            });
    };

    this.count = function (req, res, next) {
        OrderModel
            .find({})
            .lean()
            .count(function (err, amount) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({amount : amount});
            });
    };

    this.fetchById = function (req, res, next) {
        var orderId = req.params.id;
        var error;

        if (orderId && validator.isMongoId(orderId)) {
            OrderModel
                .findById(orderId)
                .exec(function (err, order) {
                    if (err) {

                        return next(err);
                    }

                    if (order) {

                        res.status(200).send(order);
                    } else {

                        res.status(200).send({fail : 'Not found such order'});
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
        var firstname;
        var totalSum;
        var products;
        var surname;
        var userId;
        var phone;
        var email;
        var order;

        if (body.userId && validator.isMongoId(body.userId)) {
            userId = body.userId;
        }

        if (body.products && Array.isArray(body.products)) {
            products = body.products;
        }

        if (body.totalSum && parseInt(body.totalSum) > 0) {
            totalSum = body.totalSum;
        }

        if (body.userFirstname && (typeof body.userFirstname === 'string') && body.userFirstname.trim().length) {
            firstname = body.userFirstname;
        }

        if (body.userSurname && (typeof body.userSurname === 'string') && body.userSurname.trim().length) {
            surname = body.userSurname;
        }

        if (body.userEmail && validator.isEmail(body.userEmail)) {
            email = body.userEmail;
        }

        if (body.userPhone && body.userPhone.match(REGEX.MOBILE_VALID)) {
            phone = body.userPhone;
        }

        if (totalSum && products && firstname && surname && phone && email) {

            // if logged user has made purchase
            if (userId) {
                order = new OrderModel({
                    firstname: firstname,
                    totalSum : totalSum,
                    products : products,
                    surname  : surname,
                    email    : email,
                    phone    : phone,
                    user     : userId
                });

                async.parallel([
                    function (callback) {
                        order.save(function (err, result) {
                            return callback(err, result)
                        });
                    },
                    function (callback) {
                        UserModel
                            .findByIdAndUpdate(userId, {$push: {orders: order._id}})
                            .exec(function (err, result) {
                                return callback(err, result);
                            });
                    },
                    function (callback) {
                        mailer.sendOrderLetter({
                            email: email,
                            order: order.orderCode}, function (err, result) {
                                return callback(err, result);
                            });
                    }
                ], function (err, result) {
                    if (err) {

                        return next(err);
                    }
                    res.status(201).send({success: 'created'});
                });
            } else {
                // for anonymous user
                order = new OrderModel({
                    firstname: firstname,
                    totalSum: totalSum,
                    products: products,
                    surname: surname,
                    email: email,
                    phone: phone
                });

                async.parallel([
                        function (callback) {
                            order.save(function (err, result) {
                                return callback(err, result)
                            });
                        },
                        function (callback) {
                            mailer.sendOrderLetter({
                                email: email,
                                order: order.orderCode
                            }, function (err, result) {
                                return callback(err, result);
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

            res.status(200).send({fail: 'Please fill all form\'s fields'});
        }
    };

    this.update = function(req, res, next) {
        var orderId = req.params.id;
        var body = req.body || {};
        var deliveryInfo;
        var products;
        var totalSum;
        var error;

        if (orderId && validator.isMongoId(orderId)) {

            if (body.deliveryInfo && (typeof body.deliveryInfo === 'string') && body.deliveryInfo.trim().length) {
                deliveryInfo = body.deliveryInfo;
            }

            if (body.totalSum && parseInt(body.totalSum) > 0) {
                totalSum = body.totalSum;
            }

            if (body.products && Array.isArray(body.products)) {
                products = body.products;
            }

            if (deliveryInfo || totalSum || products) {
                OrderModel
                    .findByIdAndUpdate(orderId, body, {new: true})
                    .exec(function (err, result) {
                    if (err) {

                        return next(err);
                    }

                    res.status(200).send({success : 'Updated'});
                });
            } else {

                res.status(200).send({fail : 'Wrong incoming data. Please try again'});
            }
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(error);
        }
    };

    this.remove = function(req, res, next) {
        var orderId = req.params.id;
        var error;

        if (orderId && validator.isMongoId(orderId)) {
            async.waterfall([
                    // delete order from orders
                    function (callback) {
                        OrderModel
                            .findByIdAndRemove(orderId)
                            .exec(function (err, result) {
                                return callback(err, result);
                            });
                    },
                    // delete order from profile's orders
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
                    res.status(200).send({success : 'removed'});
                }
            );
        } else {
            error = new Error('Bad request');
            error.status = 400;

            return next(err);
        }
    };

    this.search = function(req, res, next) {
        var body = req.body || {};
        var shipmentDate;
        var pattern;

        if (body.createdDate  && validator.isDate(body.createdDate)) {
            shipmentDate = body.createdDate;
        }

        if (shipmentDate) {
            // define regular expression for search
            pattern = new RegExp(shipmentDate, 'i');

            OrderModel
                .aggregate(
                    [{
                        $match: {shipmentDate: {$regex: pattern} }
                    }, {
                        $unwind : {path: '$product', preserveNullAndEmptyArrays: true}
                    }, {
                        $lookup: {from: 'products', foreignField: '_id', localField: 'products', as: 'products'}
                    }, {
                        $project: {_id: 1, totalPrice: 1, shipmentDate: 1, products: {$arrayElemAt:['$product', 0]}}
                    }, {
                        $group: {_id: {_id: '$_id', totalPrice: '$totalPrice', shipmentDate: '$shipmentDate'}, products: {$push: {_id: '$product._id', title: '$product.title', price: '$product.price', production: '$product.production'}}}
                    }, {
                        $project: {_id: '$_id._id', totalPrice: '$_id.totalPrice', shipmentDate: '$_id.shipmentDate', products: 1}
                    }])
                .exec(function (err, searchingResult) {
                    if (err) {

                        return next(err);
                    }

                    res.status(200).send(searchingResult);
                });
        } else {

            res.status(200).send({fail : 'Wrong incoming data. Please try again'});
        }
    };
};

module.exports = OrderHandler;
