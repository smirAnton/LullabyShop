'use strict';

var ProductHandler = require('../handlers/ProductHandler');
var AuthHandler    = require('../handlers/AuthenticationHandler');

var express        = require('express');
var router         = express.Router();

module.exports = function () {
    var handler  = new ProductHandler();
    var security = new AuthHandler();

    router.get   ('/',      security.forAll, handler.fetch);
    router.get   ('/count', security.forAll, handler.count);
    router.get   ('/search',security.forAll, handler.search);
    router.post  ('/',      security.forAll, handler.create);
    router.delete('/',      security.forAll, handler.removeAllWhereNotCategory);
    router.get   ('/:id',   security.forAll, handler.fetchById);
    router.put   ('/:id',   security.forAll, handler.update);
    router.delete('/:id',   security.forAll, handler.remove);

    return router;
};
