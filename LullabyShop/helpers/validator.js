'use strict';

var validator = require('validator');
var regExp    = require('../constants/regExp');

module.exports = function (module) {

    function isFirstname(firstname) {

        return firstname && (typeof firstname === 'string') && firstname.trim().length;
    }

    function isSurname(surname) {

        return surname && (typeof surname === 'string') && surname.trim().length;
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



    return {
        isFirstname: isFirstname,
        isProducts : isProducts,
        isSurname  : isSurname,
        isEmail    : isEmail,
        isPhone    : isPhone,
        isId       : isId
    }
};