'use strict';

var crypto = require('crypto');

var coder = (function () {

    function encryptPassword(password) {
        var encryptPassword;
        var shaSum;

        shaSum = crypto.createHash('sha256');
        shaSum.update(password);
        encryptPassword = shaSum.digest('hex');

        return encryptPassword;
    }

    return {
        encryptPassword: encryptPassword
    }
}());

module.exports = coder;