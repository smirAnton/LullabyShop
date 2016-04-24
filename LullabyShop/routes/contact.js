'use strict';

var ContactsHandler = require('../handlers/ContactsHandler');
var AuthHandler    = require('../handlers/AuthenticationHandler');

var express        = require('express');
var router         = express.Router();

module.exports = function () {
    var handler  = new ContactsHandler();
    var security = new AuthHandler();

    router.post('/', security.forAll, handler.leaveMessage);

    return router;
};
