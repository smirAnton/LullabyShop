'use strict';

var mongoose  = require('mongoose');
var TABLE     = require('../constants/dbTables');
var generator = require('../helpers/generator');

module.exports = (function () {
    var Schema   = mongoose.Schema;
    var ObjectId = Schema.Types.ObjectId;

    var OrderSchema = new Schema({
            firstname   :  {type: String,   required: true},
            surname     :  {type: String,   required: true},
            phone       :  {type: String,   required: true},
            email       :  {type: String,   required: true},
            totalSum    :  {type: Number,   default: 0},
            shipmentDate:  {type: Date,     default: new Date()},
            orderCode   :  {type: String,   default: generator.generateOrderCode()},
            user        :  {type: ObjectId, default: null, ref: 'user'},
            products    : [{type: ObjectId, default: null, ref: 'product'}]

        }, {collection: TABLE.ORDERS}
    );

    return mongoose.model('order', OrderSchema);
}());