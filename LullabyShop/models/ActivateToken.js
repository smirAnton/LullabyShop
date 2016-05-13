'use strict';

var mongoose  = require('mongoose');

var tableName = require('../constants/dbTables');

module.exports = (function () {
    var Schema = mongoose.Schema;

    var ActivateTokenSchema = new Schema({
            email      : {type: String, required: true},
            phoneSecret: {type: String, required: true, unique: true},
            emailSecret: {type: String, required: true, unique: true}

        }, {collection: tableName.ACTIVATE_TOKEN}
    );

    return mongoose.model('activateToken', ActivateTokenSchema);
}());