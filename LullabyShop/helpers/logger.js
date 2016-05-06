'use strict';

var winston = require('winston');

module.exports = function (module) {
    var path = module.filename.split('\\').splice(-2).join('\\');

    return new winston.Logger({
        transports: [
            new winston.transports.Console({
                colorize: true,
                level   : 'debug',
                label   : path
            }),

            new winston.transports.File({
                filename: 'public/all-logs.log',
                maxsize :'10000000', // 10 MB
                maxFiles:'10',
                colorize: true,
                level   : 'debug',
                label   : path
            })
        ]
    });
};