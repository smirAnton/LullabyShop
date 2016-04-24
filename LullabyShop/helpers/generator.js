'use strict';

var generator = (function () {

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateEmailSecret () {
        var secretChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var barrier     = secretChars.length;
        var result      = [];
        var index;

        for (index = 63; index >= 0; index -= 1) {
            result.push(secretChars[getRandomInt(0, barrier - 1)]);
        }

        return result.join('');
    }

    function generatePhoneSecret() {
        return getRandomInt(1000, 9999);
    }

    function generateProductCode() {
        return getRandomInt(100000, 999999);
    }

    function generateOrderCode() {
        return getRandomInt(10000, 99999);
    }


    return {
        generatePhoneSecret: generatePhoneSecret,
        generateEmailSecret: generateEmailSecret,
        generateProductCode: generateProductCode,
        generateOrderCode  : generateOrderCode
    }
}());

module.exports = generator;