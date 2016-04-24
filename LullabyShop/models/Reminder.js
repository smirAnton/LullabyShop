'use strict';

var mongoose = require('mongoose');
var TABLE    = require('../constants/dbTables');

module.exports = (function () {
    var Schema = mongoose.Schema;

    var ReminderSchema = new Schema({
            text      : {type: String, default: ''},
            limitDate : {type: Date,   default: new Date()},
            postedDate: {type: Date,   default: new Date()}

        }, {collection: TABLE.REMINDERS}
    );

    return mongoose.model('reminder', ReminderSchema);
}());