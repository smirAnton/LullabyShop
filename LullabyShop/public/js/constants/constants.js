'use strict';

define(function () {

    var pagination = {
        PRODUCTS_PER_PAGE: 12,
        TOPICS_PER_PAGE  : 4
    };

    var periodsOfTime = {
        ONE_MONTH : 2678400000 // 1 month
    };

    var avatarLimits = {
        MAX_SIZE : 300000 // 300KB
    };

    var autocompletes = {
        CITIES : [
            'Kiev', 'Kirovograd', 'Lvov', 'Mariupol', 'Mykolaiv',
            'Kharkiv', 'Dnipropetrovsk', 'Odessa', 'Zaporizhia'
        ]
    };

    return {
        periodsOfTime: periodsOfTime,
        autocompletes: autocompletes,
        avatarLimits : avatarLimits,
        pagination   : pagination
    }
});