'use strict';

var ProductHandler = require('../handlers/ProductHandler');
var AuthHandler    = require('../handlers/AuthHandler');

var express        = require('express');
var router         = express.Router();

module.exports = function () {
    var handler  = new ProductHandler();
    var security = new AuthHandler();

    router.get   ('/',               security.forAll, handler.fetch);
    router.get   ('/search/:word',   security.forAll, handler.search);
    router.get   ('/filter/:filter', security.forAll, handler.fetchByFilter);
    router.post  ('/',               security.forAll, handler.create);
    router.delete('/',               security.forAll, handler.removeAllWhereNotCategory);
    router.get   ('/:id',            security.forAll, handler.fetchById);
    router.put   ('/:id',            security.forAll, handler.update);
    router.delete('/:id',            security.forAll, handler.remove);

    return router;
};
