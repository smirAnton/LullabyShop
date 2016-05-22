'use strict';

var validator = require('../helpers/validator')();
var mailer    = require('../helpers/mailer')();

var ContactHandler = function () {

    this.leaveMessage = function (req, res, next) {
        var body    = req.body || {};
        var message = body.message;
        var phone   = body.phone;
        var email   = body.email;
        var name    = body.name;

        if (!validator.isEmptyString(message) ||
            !validator.isFirstname(name)      ||
            !validator.isEmail(email)         ||
            !validator.isPhone(phone)) {

            return res.status(400).send({fail: 'Wrong incoming data'});
        }

        mailer.sendContactsMessage(body, function (err, result) {
            if (err) {

                return next(err);
            }

            res.status(200).send({ success: 'Message successfully sent to Lullaby team' });
        });
    }
};

module.exports = ContactHandler;
