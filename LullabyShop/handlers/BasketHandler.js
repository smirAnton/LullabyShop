'use strict';

var validator       = require('validator');

var BasketHandler = function () {

    this.AddProductToBasket = function (req, res, next) {
        var session = req.session || {};
        var body = req.body || {};
        var product;

        if (body.product) {
            product = body.product;
        }

        if (product) {
            if (session.basket) {

                session.basket.push(product);
            } else {

                session.basket = [];
                session.basket.push(product);
            }

            res.status(200).send({success: 'Added'});
        } else {

            res.status(200).send({fail: 'Wrong product'});
        }
    };

    this.RemoveProductFromBasket = function (req, res, next) {
        var session = req.session || {};
        var body    = req.body    || {};

        if (session.basket) {

            session.basket.splice(body.removeIndex, 1);
            res.status(200).send({success: 'Removed'});

        } else {

            res.status(200).send({fail: 'Basket is empty'});
        }
    };
};

module.exports = BasketHandler;
