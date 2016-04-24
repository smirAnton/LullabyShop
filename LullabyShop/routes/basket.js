'use strict';

var BasketHandler = require('../handlers/BasketHandler');
var AuthHandler   = require('../handlers/AuthenticationHandler');

var express      = require('express');
var router       = express.Router();

module.exports = function () {
    var handler  = new BasketHandler();
    var security = new AuthHandler();

    router.post('/add',    security.forAll, handler.AddProductToBasket);
    router.post('/remove', security.forAll, handler.RemoveProductFromBasket);

    return router;
};