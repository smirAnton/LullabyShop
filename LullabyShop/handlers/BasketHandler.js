'use strict';

var validator = require('../helpers/validator')();

var ProductModel = require('../models/Product');

var BasketHandler = function () {

    this.addProductToBasket = function (req, res, next) {
        var session   = req.session || {};
        var body      = req.body    || {};
        var productId = body.productId;

        if (!productId) {

            return res.status(400).send({fail: 'Unknown product'});
        }

        session.basket = session.basket || [];
        session.basket.push(productId);

        res.status(200).send({success: 'Product added to basket'});
    };

    this.removeProductFromBasket = function (req, res, next) {
        var session   = req.session    || {};
        var body      = req.body       || {};
        var basket    = session.basket || [];
        var productId = body.productId;
        var removeIndex;

        if (!validator.isEmptyBasket(basket)) {

            return res.status(400).send({fail: 'Basket is empty'});
        }

        removeIndex = basket
            .map(function (product) { return product._id; })
            .indexOf(productId);

        session.basket.splice(removeIndex, 1);

        res.status(200).send({success: 'Product removed from basket'});
    };

    this.getCurrentUserBasketData = function (req, res, next) {
        var session  = req.session    || {};
        var basket   = session.basket || [];

        ProductModel
            .find({_id: {$in: basket}}, {_id: 1, price: 1}, function (err, products) {
                var limit    = products.length;
                var barrier  = basket.length;
                var totalSum = 0;
                var index;
                var step;

                if (err) {

                    return next(err);
                }

                for (step = barrier - 1; step >= 0; step -= 1) {
                    for (index = limit - 1; index >= 0; index -= 1) {
                        if (basket[step] == products[index]._id) {
                            totalSum += products[index].price;
                        }
                    }
                }

                res.status(200).send({count: barrier, totalSum: totalSum});
            });
    };

    this.getDetailsUserBasketData = function (req, res, next) {
        var session  = req.session    || {};
        var basket   = session.basket || [];

        ProductModel
            .find({_id: {$in: basket}}, {_id: 1, title: 1, price: 1, mainImage: 1, productCode: 1}, function (err, products) {
                var limit    = products.length;
                var barrier  = basket.length;
                var result   = [];
                var totalSum = 0;
                var index;
                var step;
                var _temp;

                if (err) {

                    return next(err);
                }

                for (step = barrier - 1; step >= 0; step -= 1) {
                    for (index = limit - 1; index >= 0; index -= 1) {
                        if (basket[step] == products[index]._id) {
                            _temp = products[index];

                            result.push(_temp);
                            totalSum += _temp.price
                        }
                    }
                }

                res.status(200).send({products: JSON.stringify(result), totalSum: totalSum, count: barrier});
            });
    };
};

module.exports = BasketHandler;
