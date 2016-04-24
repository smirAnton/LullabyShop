'use strict';

var TABLE    = require('../constants/dbTables');
var mongoose = require('mongoose');

module.exports = (function () {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.Types.ObjectId;

    var AdminSchema = new Schema({
            email    : {type: String, required: true, unique: true},
            phone    : {type: String, required: true, unique: true},
            password : {type: String, required: true, unique: true},
            name: {
                firstname: {type: String, required: false},
                surname  : {type: String, required: false}
            },
            birthday: {
                day  : {type: Number, min: 1,    max: 31,   required: false},
                month: {type: Number, min: 1,    max: 12,   required: false},
                year : {type: Number, min: 1916, max: 2016, required: false}
            },
            photo    : {data: Buffer,   contentType: String},
            status   : {type: Boolean,  default: false},
            lastVisit: {type: Date,     default: Date.now},
            created  : {type: Date,     default: Date.now},
            isAdmin  : {type: Boolean,  default: false},
            isBanned : {type: Boolean,  default: false},
            comments :[{type: ObjectId, default: null, ref: 'comment'}],
            orders   :[{type: ObjectId, default: null, ref: 'order'}],
            work: {
                department: {type: String, default: ''},
                company   : {type: String, default: ''},
                work_email: {type: String, default: '' }
            }
        }, {collection: TABLE.ADMINS}
    );

    return mongoose.model('admin', AdminSchema);
}());