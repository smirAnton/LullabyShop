'use strict';

var crypto = require('crypto');

module.exports = function () {

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
};