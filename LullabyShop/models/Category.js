'use strict';

var TABLE    = require('../constants/dbTables');
var mongoose = require('mongoose');

module.exports = (function () {
    var Schema   = mongoose.Schema;
    var ObjectId = Schema.Types.ObjectId;

    var CategorySchema = new Schema({
            title   :  {type: String, unique: true, required: true},
            products: [{type: ObjectId, ref: 'product', default: null}]

        }, {collection: TABLE.CATEGORIES}
    );

    return mongoose.model('category', CategorySchema);
}());