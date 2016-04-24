'use strict';

var magicNumbers = (function() {

    return {
        // for cookies
        THREE_MONTHS   : 1000 * 60 * 60 * 24 * 30 * 3,
        ONE_MONTH      : 1000 * 60 * 60 * 24 * 30,
        ONE_WEEK       : 1000 * 60 * 60 * 24 * 7,
        ONE_DAY        : 1000 * 60 * 60 * 24
    }
}());

module.exports = magicNumbers;