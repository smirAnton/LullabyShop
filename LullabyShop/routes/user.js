'use strict';

var AuthHandler = require('../handlers/AuthHandler');
var UserHandler = require('../handlers/UserHandler');

var express     = require('express');
var router      = express.Router();

module.exports = function () {
    var handler  = new UserHandler();
    var security = new AuthHandler();

    router.get   ('/',        security.onlyAdmin, handler.fetch);
    router.get   ('/count',   security.onlyAdmin, handler.count);
    router.get   ('/:id',     security.onlyAuth,  handler.fetchByIdWithOrders);
    router.get   ('/ban/:id', security.onlyAdmin, handler.changeBanStatus);
    router.post  ('/upload',  security.onlyAuth,  handler.uploadAvatar);
    router.put   ('/:id',     security.onlyAuth,  handler.update);
    router.delete('/:id',     security.onlyAdmin, handler.remove);

    return router;
};