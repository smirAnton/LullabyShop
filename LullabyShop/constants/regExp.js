'use strict';

var regExp = (function() {

    return {
        MOBILE_VALID: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
    };
}());

module.exports = regExp;