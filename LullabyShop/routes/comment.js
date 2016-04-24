'use strict';

var CommentHandler = require('../handlers/CommentHandler');
var AuthHandler    = require('../handlers/AuthenticationHandler');

var express        = require('express');
var router         = express.Router();

module.exports = function () {
    var handler  = new CommentHandler();
    var security = new AuthHandler();

    router.get   ('/',       security.forAll,    handler.fetch);
    router.get   ('/count',  security.forAll,    handler.count);
    router.post  ('/',       security.forAll,    handler.create);
    router.post  ('/search', security.forAll,    handler.search);
    router.get   ('/:id',    security.onlyAuth,  handler.fetchById);
    router.put   ('/:id',    security.onlyAdmin, handler.update);
    router.delete('/:id',    security.onlyAdmin, handler.remove);

    return router;
};
