'use strict';

var AuthHandler = require('../handlers/AuthHandler');

var express     = require('express');
var router      = express.Router();

module.exports = function () {
    var security = new AuthHandler();

    // auth
    router.get ('/logout',                 security.onlyAuth, security.logout);
    router.get ('/session',                security.forAll,   security.getSessionData);
    router.post('/login',                  security.forAll,   security.login);
    router.post('/register',               security.forAll,   security.register);


    // registration activation
    router.get ('/activate/mail',          security.forAll,   security.provideActivationSecretToEmail);
    router.get ('/activate/mail/:secret',  security.forAll,   security.activateRegistrationByEmail);
    router.get ('/activate/mobile',        security.forAll,   security.provideActivationSecretToMobile);
    router.post('/activate/mobile',        security.forAll,   security.activateRegistrationByMobile);

    // recovery password
    router.post('/recovery',               security.forAll,   security.useRecovery);
    router.get ('/recovery/mail',          security.forAll,   security.provideRecoverySecretToEmail);
    router.get ('/recovery/mobile',        security.forAll,   security.provideRecoverySecretToMobile);
    router.get ('/recovery/mail/:secret',  security.forAll,   security.recoveryByMail);
    router.post('/recovery/mobile',        security.forAll,   security.recoveryByMobile);
    router.post('/recovery/password',      security.forAll,   security.setNewPassword);

    return router;
};
