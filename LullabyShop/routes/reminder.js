'use strict';

var ReminderHandler = require('../handlers/ReminderHandler');
var AuthHandler       = require('../handlers/AuthHandler');

var express           = require('express');
var router            = express.Router();

module.exports = function () {
    var handler  = new ReminderHandler();
    var security = new AuthHandler();

    router.get   ('/',    security.onlyAdmin, handler.fetch);
    router.post  ('/',    security.onlyAdmin, handler.sendReminderToPassiveUsers);
    router.delete('/:id', security.onlyAdmin, handler.remove);

    return router;
};
