'use strict';

var TABLE    = require('../constants/dbTables');
var mongoose = require('mongoose');

module.exports = (function () {
    var Schema   = mongoose.Schema;
    var ObjectId = Schema.Types.ObjectId;

    var UserSchema = new Schema({
            email     : {type: String,  required: true, unique: true},
            phone     : {type: String,  required: true, unique: true},
            password  : {type: String,  required: true, unique: false},
            firstname : {type: String,  required: false, unique: false},
            surname   : {type: String,  required: false, unique: false},
            gender    : {type: String,  required: false, unique: false},
            birthday  : {type: Date,     default: new Date()},
            city      : {type: String,   default: null},
            street    : {type: String,   default: null},
            avatar    : {type: String,   default: 'images/defaults/default_avatar.jpg'},
            status    : {type: Boolean,  default: false},
            lastVisit : {type: Date,     default: new Date()},
            created   : {type: Date,     default: new Date()},
            isAdmin   : {type: Boolean,  default: false},
            isBanned  : {type: Boolean,  default: false},
            comments  :[{type: ObjectId, default: null, ref: 'comment'}],
            orders    :[{type: ObjectId, default: null, ref: 'order'}]

        }, {collection: TABLE.USERS}
    );

    return mongoose.model('user', UserSchema);
}());

