'use strict';

var ProductModel = require('../models/Product');

var validator    = require('../helpers/validator')();

var SessionHandler = function () {

    this.fetch = function (req, res, next) {
        var session = req.session    || {};
        var basket  = session.basket || [];
        var options = {_id: 1, price: 1};

        ProductModel
            .find({_id: { $in: basket }}, options)
            .lean()
            .exec(function (err, products) {
                var totalSum = 0;
                var barrier  = basket.length;
                var limit    = products.length;
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

                session.totalSum = totalSum;

                res.status(200).send(session);
            });
    };

};

module.exports = SessionHandler;
