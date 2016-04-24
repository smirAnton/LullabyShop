'use strict';

var mongoose = require('mongoose');
var TABLE    = require('../constants/dbTables');

module.exports = (function () {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.Types.ObjectId;

    var CommentSchema = new Schema({
            text      : {type: String,   required: true},
            product   : {type: ObjectId, required: true, ref: 'product'},
            user      : {type: ObjectId, default: null,  ref: 'user'},
            authorName: {type: String,   default: 'Anonymous'},
            postedDate: {type: Date,     default: new Date()}

        }, {collection: TABLE.COMMENTS}
    );

    return mongoose.model('comment', CommentSchema);
}());

