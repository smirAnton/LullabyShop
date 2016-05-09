'use strict';

var CommentHandler = require('../handlers/CommentHandler');
var AuthHandler    = require('../handlers/AuthHandler');

var express        = require('express');
var router         = express.Router();

module.exports = function () {
    var handler  = new CommentHandler();
    var security = new AuthHandler();

    router.get   ('/',       security.forAll,    handler.fetch);
    router.get   ('/count',  security.forAll,    handler.count);
    router.post  ('/',       security.forAll,    handler.create);
    router.get   ('/:id',    security.onlyAuth,  handler.fetchById);
    router.delete('/:id',    security.onlyAdmin, handler.remove);

    return router;
};
