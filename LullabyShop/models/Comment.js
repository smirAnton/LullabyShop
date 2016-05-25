'use strict';

var mongoose  = require('mongoose');

var tableName = require('../constants/dbTables');

module.exports = (function () {
    var Schema   = mongoose.Schema;
    var ObjectId = Schema.Types.ObjectId;

    var CommentSchema = new Schema({
            text      : { type: String,   required: true },
            user      : { type: ObjectId, default:  null, ref: 'user' },
            product   : { type: ObjectId, required: true, ref: 'product' },
            username  : { type: String,   default:  null },
            postedDate: { type: Date,     default:  new Date() }

        }, {collection: tableName.COMMENTS}
    );

    return mongoose.model('comment', CommentSchema);
}());

