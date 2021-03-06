'use strict';

var CategoryHandler = require('../handlers/CategoryHandler');
var AuthHandler     = require('../handlers/AuthHandler');

var express         = require('express');
var router          = express.Router();

module.exports = function () {
    var handler  = new CategoryHandler();
    var security = new AuthHandler();

    router.get   ('/',    security.forAll,    handler.fetch);
    router.post  ('/',    security.onlyAdmin, handler.create);
    router.put   ('/:id', security.onlyAdmin, handler.update);
    router.delete('/:id', security.onlyAdmin, handler.remove);

    return router;
};
