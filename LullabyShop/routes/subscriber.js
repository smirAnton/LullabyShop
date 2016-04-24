'use strict';

var SubscriberHandler = require('../handlers/SubscriberHandler');
var AuthHandler       = require('../handlers/AuthenticationHandler');

var express      = require('express');
var router       = express.Router();

module.exports = function () {
    var handler  = new SubscriberHandler();
    var security = new AuthHandler();

    router.post('/join', security.forAll, handler.join);

    return router;
};
