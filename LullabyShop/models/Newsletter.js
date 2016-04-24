'use strict';

var mongoose = require('mongoose');
var TABLE    = require('../constants/dbTables');

module.exports = (function () {
    var Schema = mongoose.Schema;

    var NewsletterSchema = new Schema({
            text      : {type: String, default: ''},
            postedDate: {type: Date,   default: new Date()}

        }, {collection: TABLE.NEWSLETTERS}
    );

    return mongoose.model('newsletter', NewsletterSchema);
}());