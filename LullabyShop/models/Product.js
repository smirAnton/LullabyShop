'use strict';

var TABLE     = require('../constants/dbTables');
var mongoose  = require('mongoose');
var generator = require('../helpers/generator');

module.exports = (function () {
    var Schema   = mongoose.Schema;
    var ObjectId = Schema.Types.ObjectId;

    var ProductSchema = new Schema({
            title       :  {type: String,   unique: true,    required: true},
            price       :  {type: Number,   unique: false,   required: true},
            brand       :  {type: String,   unique: false,   required: true},
            description :  {type: String,   unique: false,   required: true},
            category    :  {type: ObjectId, ref: 'category', default: null},
            comments    : [{type: ObjectId, ref: 'comment',  default: null}],
            createdDate :  {type: Date,     default: new Date()},
            productCode :  {type: String,   default: generator.generateProductCode()},
            mainImage   :  {type: String,   default: 'images/defaults/default_product.png'},
            searchImage :  {type: String,   default: 'images/defaults/default_product.png'}

        }, {collection: TABLE.PRODUCTS}
    );

    return mongoose.model('product', ProductSchema);
}());

