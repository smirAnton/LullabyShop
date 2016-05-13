'use strict';

define(['moment'],
    function (moment) {

        var formatDate = function(date) {
            return moment(date).format('L');
        };

        return {
            formatDate: formatDate
        }
    }
);