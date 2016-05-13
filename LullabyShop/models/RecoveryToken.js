'use strict';

var mongoose  = require('mongoose');

var tableName = require('../constants/dbTables');

module.exports = (function () {
    var Schema = mongoose.Schema;

    var recoveryTokenSchema = new Schema({
            email      : {type: String, required: true},
            phoneSecret: {type: String, required: true, unique: true},
            emailSecret: {type: String, required: true, unique: true}

        }, {collection: tableName.RECOVERY_TOKENS}
    );

    return mongoose.model('recoveryToken', recoveryTokenSchema);
}());