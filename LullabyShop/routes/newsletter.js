'use strict';

var NewsletterHandler = require('../handlers/NewsletterHandler');
var AuthHandler       = require('../handlers/AuthHandler');

var express           = require('express');
var router            = express.Router();

module.exports = function () {
    var handler  = new NewsletterHandler();
    var security = new AuthHandler();

    router.get   ('/',    security.onlyAdmin, handler.fetch);
    router.post  ('/',    security.onlyAdmin, handler.sendNewsletter);
    router.delete('/:id', security.onlyAdmin, handler.remove);

    return router;
};
