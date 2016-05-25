'use strict';

var ProductModel = require('../models/Product');

var validator    = require('../helpers/validator')();

var BasketHandler = function () {

    this.addProductToBasket = function (req, res, next) {
        var body       = req.body       || { };
        var productId  = body.productId;
        var session    = req.session    || { };
        session.basket = session.basket || [ ];

        if (!validator.isId(productId)) {

            return res.status(400).send({ fail: 'Unknown product' });
        }

        // add productId to basket
        session.basket.push(productId);

        res.status(200).send({success: 'Product added to basket'});
    };

    this.removeProductFromBasket = function (req, res, next) {
        var session     = req.session    || {};
        var body        = req.body       || {};
        var basket      = session.basket || [];
        var removeIndex = body.removeIndex;

        if (!basket.length) {

            return res.status(400).send({fail: 'Basket is empty'});
        }

        session.basket.splice(removeIndex, 1);

        res.status(200).send({success: 'Product removed from basket'});
    };

    this.fetchBasketProducts = function (req, res, next) {
        var session = req.session    || {};
        var basket  = session.basket || [];
        var options = {
            _id        : 1,
            title      : 1,
            price      : 1,
            mainImage  : 1,
            productCode: 1
        };

        ProductModel
            .find({_id: {$in: basket}}, options)
            .lean()
            .exec(function (err, productsFromDb) {
                var limit   = basket.length;
                var barrier = productsFromDb.length;
                var result  = [];
                var index;
                var step;

                if (err) {

                    return next(err);
                }

                for (step = 0; step < limit; step += 1) {

                    for (index = barrier - 1; index >= 0; index -= 1) {

                        if (basket[step] == productsFromDb[index]._id) {
                            result.push(productsFromDb[index]);
                        }
                    }
                }

                res.status(200).send(result);
            });
    };
};

module.exports = BasketHandler;
