'use strict';

var mongoose = require('mongoose');
var TABLE    = require('../constants/dbTables');

module.exports = (function () {
    var Schema   = mongoose.Schema;

    var BlogSchema = new Schema({
            title      :  {type: String, required: true},
            briefInfo  :  {type: String, required: true},
            text       :  {type: String, required: true},
            postedDate :  {type: Date,   default: new Date()},
            mainImage  :  {type: String, default: 'images/defaults/default_blog.jpg'},
            topicImage :  {type: String, default: 'images/defaults/default_blog.jpg'}

        }, {collection: TABLE.BLOGS}
    );

    return mongoose.model('blog', BlogSchema);
}());