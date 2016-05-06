'use strict';

var AdminHandler = require('../handlers/AdminHandler');
var AuthHandler  = require('../handlers/AuthHandler');

var express      = require('express');
var router       = express.Router();

module.exports = function () {
    var handler  = new AdminHandler();
    var security = new AuthHandler();

    router.post('/ban', security.onlyAdmin, handler.changeBanStatus);

    return router;
};