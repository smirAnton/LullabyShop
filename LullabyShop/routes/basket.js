'use strict';

var BasketHandler = require('../handlers/BasketHandler');
var AuthHandler   = require('../handlers/AuthHandler');

var express       = require('express');
var router        = express.Router();

module.exports = function () {
    var handler  = new BasketHandler();
    var security = new AuthHandler();

    router.get ('/details',security.forAll, handler.getDetailsUserBasketData);
    router.post('/add',    security.forAll, handler.addProductToBasket);
    router.post('/remove', security.forAll, handler.removeProductFromBasket);

    return router;
};