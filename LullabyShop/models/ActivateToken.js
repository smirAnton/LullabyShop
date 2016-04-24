'use strict';

var mongoose = require('mongoose');
var TABLE    = require('../constants/dbTables');

module.exports = (function () {
    var Schema = mongoose.Schema;

    var ActivateTokenSchema = new Schema({
            userEmail   : {type: String, unique: false, required: true},
            emailSecret : {type: String, unique: true,  required: true},
            phoneSecret : {type: Number, unique: false, required: true}

        }, {collection: TABLE.ACTIVATE_TOKEN}
    );

    return mongoose.model('activateToken', ActivateTokenSchema);
}());