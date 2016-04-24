'use strict';

var AdminHandler = require('../handlers/AdminHandler');
var AuthHandler  = require('../handlers/AuthenticationHandler');

var express      = require('express');
var router       = express.Router();

module.exports = function () {
    var handler  = new AdminHandler();
    var security = new AuthHandler();

    router.put('/ban/:id',   security.onlyAdmin, handler.banUser);
    router.put('/unban/:id', security.onlyAdmin, handler.unbanUser);

    return router;
};