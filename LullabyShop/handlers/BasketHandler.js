'use strict';

var validator = require('../helpers/validator')();

var BasketHandler = function () {

    this.addProductToBasket = function (req, res, next) {
        var session   = req.session || {};
        var body      = req.body    || {};
        var product   = body.product;

        if (!product) {

            return res.status(422).send({fail: 'Unknown product'});
        }

        session.basket = session.basket || [];
        session.basket.push(JSON.parse(product));

        res.status(200).send({success: 'Product added to basket'});
    };

    this.removeProductFromBasket = function (req, res, next) {
        var session     = req.session || {};
        var body        = req.body    || {};
        var basket      = session.basket;
        var removeIndex = body.removeIndex;


        if (!validator.isEmptyBasket(basket)) {

            return res.status(400).send({fail: 'Basket is empty'});
        }

        session.basket.splice(removeIndex, 1);

        res.status(200).send({success: 'Product removed from basket'});
    };
};

module.exports = BasketHandler;
