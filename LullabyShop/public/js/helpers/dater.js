'use strict';

define(['moment'], function (moment) {

    function formatDate(date) {

        return moment(date).format('L');
    }

    return {
        formatDate: formatDate
    }
});