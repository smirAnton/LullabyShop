'use strict';

var mongoose = require('mongoose');
var TABLE    = require('../constants/dbTables');

module.exports = (function () {
    var Schema = mongoose.Schema;

    var SubscriberSchema = new Schema({
            email      : {type: String, unique : true},
            createdDate: {type: Date,   default: new Date()}

        }, {collection: TABLE.SUBSCRIBERS}
    );

    return mongoose.model('subscriber', SubscriberSchema);
}());