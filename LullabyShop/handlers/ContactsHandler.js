'use strict';

var validator = require('validator');

var mailer    = require('../helpers/mailer')();
var regExp    = require('../constants/regExp');

var ContactHandler = function () {

    this.leaveMessage = function (req, res, next) {
        var body = req.body || {};
        var message;
        var options;
        var phone;
        var email;
        var name;

        if (body.message && (typeof body.message === 'string') && body.message.trim().length) {
            message = body.message;
        }

        if (body.phone && body.phone.match(regExp.PHONE)) {
            phone = body.phone;
        }

        if (body.name && (typeof body.name === 'string') && body.name.trim().length) {
            name = body.name;
        }

        if (body.email && (typeof body.email === 'string') &&  validator.isEmail(body.email)) {
            email = body.email;
        }

        // check if profile provided all necessary data
        if (name && email && phone && message) {

            options = {
                message: message,
                phone  : phone,
                email  : email,
                name   : name
            };

            mailer.sendContactsMessage(options, function(err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success : 'Message has been successfully sent to Lullaby team'});
            });
        } else {

            res.status(200).send({fail : 'Wrong incoming data. Please, try again'});
        }
    }
};

module.exports = ContactHandler;
