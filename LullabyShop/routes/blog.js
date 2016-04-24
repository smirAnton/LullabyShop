'use strict';

var AuthHandler = require('../handlers/AuthenticationHandler');
var BlogHandler = require('../handlers/BlogHandler');

var express     = require('express');
var router      = express.Router();

module.exports = function () {
    var handler  = new BlogHandler();
    var security = new AuthHandler();

    router.get   ('/',       security.forAll,    handler.fetch);
    router.get   ('/count',  security.forAll,    handler.count);
    router.post  ('/',       security.onlyAdmin, handler.create);
    router.post  ('/search', security.forAll,    handler.search);
    router.get   ('/:id',    security.forAll,    handler.fetchById);
    router.put   ('/:id',    security.onlyAdmin, handler.update);
    router.delete('/:id',    security.onlyAdmin, handler.remove);

    return router;
};