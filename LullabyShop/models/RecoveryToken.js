'use strict';

var TABLE    = require('../constants/dbTables');
var mongoose = require('mongoose');

module.exports = (function () {
    var Schema = mongoose.Schema;

    var ForgetTokenSchema = new Schema({
            userEmail   : {type: String, unique: false, required: true},
            emailSecret : {type: String, unique: true,  required: true},
            phoneSecret : {type: Number, unique: false, required: true}

        }, {collection: TABLE.RECOVERY_TOKENS}
    );

    return mongoose.model('forgetToken', ForgetTokenSchema);
}());