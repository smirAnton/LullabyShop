'use strict';

var dbTables = (function() {

    return {
        RECOVERY_TOKENS: 'recovery_tokens',
        ACTIVATE_TOKEN : 'activate_tokens',
        SUBSCRIBERS    : 'subscribers',
        NEWSLETTERS    : 'newsletters',
        CATEGORIES     : 'categories',
        REMINDERS      : 'reminders',
        COMMENTS       : 'comments',
        PRODUCTS       : 'products',
        ORDERS         : 'orders',
        ADMINS         : 'admins',
        USERS          : 'users',
        BLOGS          : 'blogs'
    };
}());

module.exports = dbTables;