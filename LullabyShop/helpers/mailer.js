'use strict';

var nodemailer = require("nodemailer");
var logger     = require('./logger')(module);
var util       = require('util');
var env        = process.env;

module.exports = function () {
    var sender = nodemailer.createTransport({
        service : env.SERVICE,
        auth: {
            user: env.USER,
            pass: env.PASSWORD
        }
    });

    function sendContactsMessage(userData, callback) {
        var date    = new Date();
        var subject = 'Customer\'s message from lullaby store (dated from '
            + date.toDateString() + ',  at: ' + date.toTimeString() + ')';

        var mailOptions = {
            from    : env.USER,
            to      : env.USER,
            subject : subject,

            text    : util.format('From: %s\r\nPhone: %s\r\nEmail: %s\r\nMessage: %s',
                            userData.name,
                            userData.phone,
                            userData.email,
                            userData.message)
        };

        sender.sendMail(mailOptions, function(err, result) {
            return callback(err, result);
        });
    }

    function sendNewsletter(options, callback) {
        var mailOptions = {
            from    : env.FROM,
            to      : options.email,
            subject : 'Newsletter from Lullaby',
            text    : options.text
        };

        sender.sendMail(mailOptions, function(err, result) {
            return callback(err, result);
        });
    }

    function sendReminder(options, callback) {
        var mailOptions = {
            from    : env.FROM,
            to      : options.email,
            subject : 'Reminder from Lullaby',
            text    : options.text
        };

        sender.sendMail(mailOptions, function(err, result) {
            return callback(err, result);
        });
    }

    function sendOrderLetter(options, callback) {
        var mailOptions = {
            from    : env.FROM,
            to      : options.email,
            subject : 'Order information from Lullaby',
            text    : 'Hello. Please, receive your order number: ' + options.order
        };

        sender.sendMail(mailOptions, function(err, result) {
            return callback(err, result);
        });
    }

    function sendActivationLink(secret, userEmail, callback) {
        var mailOptions = {
            from   : env.FROM,
            to     : userEmail,
            subject: 'Lullaby service team',

            text   : 'You need to confirm your email address in order to activate your Lullaby account. '
                   + 'Activating your account will give you more benefits and better control. \n'
                   + 'Please click the link: http://localhost:3000/#lullaby/activate/mail/' + secret
        };

        sender.sendMail(mailOptions, function (err, result) {
            return callback(err, result);
        });
    }

    function sendRecoveryLink(tokenSecret, userEmail, callback) {
        var mailOptions = {
            from   :  env.FROM,
            to     :  userEmail,
            subject: 'Lullaby service team',

            text   : 'No need to worry! You can simply reset your password on Lullaby home by clicking the '
                   + 'link: http://localhost:3000/#lullaby/recovery/' + tokenSecret
        };

        sender.sendMail(mailOptions, function (err, result) {
            return callback(err, result);
        });
    }

    return {
        sendContactsMessage: sendContactsMessage,
        sendActivationLink : sendActivationLink,
        sendRecoveryLink   : sendRecoveryLink,
        sendOrderLetter    : sendOrderLetter,
        sendNewsletter     : sendNewsletter,
        sendReminder       : sendReminder
    }
};
