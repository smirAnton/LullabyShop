'use strict';

var SessionHandler = require('../handlers/SessionHandler');
var AuthHandler    = require('../handlers/AuthHandler');

var express     = require('express');
var router      = express.Router();

module.exports = function () {
    var sessionHandler = new SessionHandler();
    var authHandler    = new AuthHandler();

    // session data
    router.get ('/session',                authHandler.forAll,   sessionHandler.fetch);

    // auth
    router.get ('/logout',                 authHandler.onlyAuth, authHandler.logout);
    router.post('/login',                  authHandler.forAll,   authHandler.login);
    router.post('/register',               authHandler.forAll,   authHandler.register);

    // register activation
    router.get ('/activate/mail',          authHandler.forAll,   authHandler.provideActivationSecretToEmail);
    router.get ('/activate/mail/:secret',  authHandler.forAll,   authHandler.activateRegistrationByEmail);
    router.get ('/activate/mobile',        authHandler.forAll,   authHandler.provideActivationSecretToMobile);
    router.post('/activate/mobile',        authHandler.forAll,   authHandler.activateRegistrationByMobile);

    // recovery password
    router.post('/recovery',               authHandler.forAll,   authHandler.useRecovery);
    router.get ('/recovery/mail',          authHandler.forAll,   authHandler.provideRecoverySecretToEmail);
    router.get ('/recovery/mobile',        authHandler.forAll,   authHandler.provideRecoverySecretToMobile);
    router.get ('/recovery/mail/:secret',  authHandler.forAll,   authHandler.recoveryByMail);
    router.post('/recovery/mobile',        authHandler.forAll,   authHandler.recoveryByMobile);
    router.post('/recovery/password',      authHandler.forAll,   authHandler.setNewPassword);

    return router;
};
