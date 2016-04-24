'use strict';

var AuthHandler = require('../handlers/AuthenticationHandler');

var express     = require('express');
var router      = express.Router();

module.exports = function () {
    var auth = new AuthHandler();

    // auth
    router.get ('/check',                  auth.forAll,   auth.checkIsAuth);
    router.post('/login',                  auth.forAll,   auth.signIn);
    router.post('/registration',           auth.forAll,   auth.signUp);
    router.post('/logout',                 auth.onlyAuth, auth.signOut);

    // registration activation
    router.post('/activate/mail',          auth.forAll,   auth.provideActivationSecretToEmail);
    router.post('/activate/mobile',        auth.forAll,   auth.provideActivationSecretToMobile);
    router.post('/activate/mail/secret',   auth.forAll,   auth.activateRegistrationByEmail);
    router.post('/activate/mobile/secret', auth.forAll,   auth.activateRegistrationByMobile);

    // recovery password
    router.post('/recovery',               auth.forAll,   auth.useRecovery);
    router.post('/recovery/mail',          auth.forAll,   auth.provideRecoverySecretToEmail);
    router.post('/recovery/mobile',        auth.forAll,   auth.provideRecoverySecretToMobile);
    router.post('/recovery/password',      auth.forAll,   auth.setNewPassword);
    router.post('/recovery/mail/secret',   auth.forAll,   auth.recoveryByMail);
    router.post('/recovery/mobile/secret', auth.forAll,   auth.recoveryByMobile);

    return router;
};
