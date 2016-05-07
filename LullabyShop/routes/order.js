'use strict';

var OrderHandler = require('../handlers/OrderHandler');
var AuthHandler  = require('../handlers/AuthHandler');

var express      = require('express');
var router       = express.Router();

module.exports = function () {
    var handler  = new OrderHandler();
    var security = new AuthHandler();

    router.get   ('/',       security.forAll, handler.fetch);
    router.get   ('/count',  security.forAll, handler.count);
    router.post  ('/',       security.forAll, handler.create);
    router.get   ('/:id',    security.forAll, handler.fetchById);
    router.delete('/:id',    security.forAll, handler.remove);

    return router;
};
