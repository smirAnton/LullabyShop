'use strict';

var AuthenticationHandler = require('../handlers/AuthenticationHandler');
var UserHandler           = require('../handlers/UserHandler');

var express               = require('express');
var router                = express.Router();

module.exports = function () {
    var handler  = new UserHandler();
    var security = new AuthenticationHandler();

    router.get   ('/',           security.onlyAdmin, handler.fetch);
    router.get   ('/count',      security.onlyAdmin, handler.count);
    router.get   ('/:id',        security.onlyAuth,  handler.fetchById);
    router.post  ('/upload/:id', security.onlyAuth,  handler.uploadAvatar);
    router.put   ('/:id',        security.onlyAuth,  handler.update);
    router.delete('/:id',        security.onlyAdmin, handler.remove);

    return router;
};