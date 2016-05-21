'use strict';

var validator = require('validator');
var regExp    = require('../constants/regExp');

module.exports = function (module) {

    function isEmptyString(str) {
        return str && (typeof str === 'string') && str.trim().length;
    }

    function isFirstname(firstname) {
        return isEmptyString(firstname);
    }

    function isSurname(surname) {
        return isEmptyString(surname);
    }

    function isStreet(street) {
        return isEmptyString(street);
    }

    function isCity(city) {
        return isEmptyString(city);
    }

    function isGender(gender) {
        return isEmptyString(gender);
    }

    function isPassword(password) {
        return isEmptyString(password);
    }

    function isBirthday(birthday) {
        return birthday && validator.isDate(birthday);
    }

    function isEmail(email) {

        return email && validator.isEmail(email);
    }

    function isPhone(phone) {
        return phone && phone.match(regExp.PHONE);
    }

    function isProducts(products) {
        return products && Array.isArray(products);
    }

    function isId(id) {
        return id && validator.isMongoId(id);
    }

    function isBoolean(value) {
        return value && value.in([true, false]);
    }

    function isEmailSecret(secret) {
        return isEmptyString(secret) && secret.length === 60;
    }

    function isPhoneSecret(secret) {
        return validator.isNumeric && secret.length === 4;
    }

    return {
        isEmptyString: isEmptyString,
        isEmailSecret: isEmailSecret,
        isPhoneSecret: isPhoneSecret,
        isFirstname  : isFirstname,
        isPassword   : isPassword,
        isBirthday   : isBirthday,
        isProducts   : isProducts,
        isBoolean    : isBoolean,
        isSurname    : isSurname,
        isGender     : isGender,
        isStreet     : isStreet,
        isEmail      : isEmail,
        isPhone      : isPhone,
        isCity       : isCity,
        isId         : isId
    }
};