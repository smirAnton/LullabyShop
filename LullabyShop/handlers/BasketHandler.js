'use strict';

var validator = require('validator');

var BasketHandler = function () {

    this.addProductToBasket = function (req, res, next) {
        var session = req.session || {};
        var body    = req.body    || {};
        var product = body.product;

        if (!product) {

            return res.status(422).send({fail: 'Wrong incoming data'});
        }

        session.basket = session.basket || [];
        session.basket.push(product);

        res.status(200).send({success: 'Product added to basket'});
    };

    this.removeProductFromBasket = function (req, res, next) {
        var session     = req.session || {};
        var body        = req.body    || {};
        var removeIndex = body.removeIndex;


        if (!session.basket || !session.basket.length) {

            return res.status(400).send({fail: 'Basket is empty'});
        }
        // delete product from basket
        session.basket.splice(removeIndex, 1);

        res.status(200).send({success: 'Product removed from basket'});
    };
};

module.exports = BasketHandler;
