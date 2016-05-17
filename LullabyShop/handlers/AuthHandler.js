'use strict';

var ActivateTokenModel = require('../models/ActivateToken');
var RecoveryTokenModel = require('../models/RecoveryToken');
var UserModel          = require('../models/User');

var async              = require('async');

var cookieLifeTime     = require('../constants/magicNumbers');
var validator          = require('../helpers/validator')();
var generator          = require('../helpers/generator')();
var twilio             = require('../helpers/twilio')();
var logger             = require('../helpers/logger')(module);
var mailer             = require('../helpers/mailer')();
var coder              = require('../helpers/coder')();

var AuthenticationHandler = function () {
    // access to routes
    this.onlyAuth = function (req, res, next) {
        if (req.session && req.session.loggedIn) {
            return next();
        }
        res.status(401).send({fail: 'You should login firstly'});
    };

    this.onlyAdmin = function (req, res, next) {
        if (req.session && req.session.isAdmin) {
            return next();
        }
        res.status(401).send({fail: 'Only for admin'});
    };

    this.forAll = function (req, res, next) {
        return next();
    };

    this.getSessionData = function (req, res, next) {
        var session = req.session || {};
        res.status(200).send(session);
    };

    // authentication
    function findModelByEmail(Model, email, callback) {
        Model
            .findOne({email: email})
            .lean()
            .exec(function (err, model) {
                if (err) {

                    return callback(err);
                }

                return callback(null, model);
            })
    }

    this.login = function (req, res, next) {
        var body       = req.body || {};
        var rememberMe = body.rememberMe;
        var password   = body.password;
        var email      = body.email;

        if (!validator.isEmail(email) || !validator.isPassword(password)) {

            return res.status(400).send({fail: 'Please, provide email and password'});
        }

        findModelByEmail(UserModel, email, function (err, user) {
            if (err) {

                return next(err);
            }

            if (!user) {

                return res.status(400).send({fail: 'Email is not registered. Please, register'});
            }

            if (user.password !== coder.encryptPassword(password)) {

                return res.status(400).send({fail: 'Wrong password. Please try again'});
            }

            if (user.isBanned) {

                return res.status(400).send({fail: 'Sorry, you are banned'});
            }

            findModelByEmail (ActivateTokenModel, email, function (err, token) {
                    if (err) {

                        return next(err);
                    }

                    if (token) {
                        req.session.email = email;

                        return res.status(402).send({fail: 'Account is not activated. Please, activate'});
                    }

                    if (rememberMe) {
                        req.session.cookie.maxAge = cookieLifeTime.ONE_MONTH;
                        req.session.rememberMe = true;
                    } else {
                        req.session.cookie.expires = false;
                    }
                    // add to session user data
                    req.session.loggedIn  = true;
                    req.session.firstname = user.firstname;
                    req.session.isAdmin   = user.isAdmin;
                    req.session.userId    = user._id;
                    req.session.email     = user.email;
                    req.session.phone     = user.phone;

                    delete user.password;

                    return res.status(200).send(user);
                })
        });
    };

    this.register = function (req, res, next) {
        var body              = req.body || {};
        var confirmedPassword = body.confirmedPassword;
        var firstname         = body.firstname;
        var password          = body.password;
        var surname           = body.surname;
        var gender            = body.gender;
        var phone             = body.phone;
        var email             = body.email;

        if (!validator.isPassword(confirmedPassword) ||
            !validator.isFirstname(firstname)        ||
            !validator.isPassword(password)          ||
            !validator.isSurname(surname)            ||
            !validator.isGender(gender)              ||
            !validator.isPhone(phone)                ||
            !validator.isEmail(email)) {

            return res.status(400).send({fail: 'Please provide correct personal data'});
        }

        if (password !== confirmedPassword) {

            return res.status(400).send({fail: 'Passwords are not matched. Please, try again'});
        }

        findModelByEmail(UserModel, email, function (err, user) {
            if (err) {

                return next(err);
            }
            // check if email is already registered
            if (user) {

                return res.status(400).send({fail: 'This email is already registered. Please provide another one'});
            }

            // add to session user email
            req.session.email = email;

            async.parallel([
                function (callback) {
                    new UserModel({
                        firstname: firstname,
                        password : coder.encryptPassword(password),
                        surname  : surname,
                        gender   : gender,
                        phone    : phone,
                        email    : email
                    }).save(function (err, result) {
                        return callback(err, result);
                    });
                },
                function (callback) {
                    new ActivateTokenModel({
                        emailSecret: generator.generateEmailSecret(),
                        phoneSecret: generator.generatePhoneSecret(),
                        email      : email
                    }).save(function (err, result) {
                        return callback(err, result);
                    });
                }
            ],function (err, result) {
                if (err) {

                    return next(err);
                }

                return res.status(200).send({success: 'You successfully registered. Please activate your account'});
            });
        });
    };

    this.logout = function (req, res, next) {
        var session = req.session || {};
        var userId  = session.userId;
        var email   = session.email;

        if (!validator.isId(userId) || !validator.isEmail(email)) {

            return res.status(400).send({fail: 'You should login firstly'});
        }

        UserModel
            .update({email: email}, {$set : {lastVisit: new Date()}},
                function (err, updatedUser) {
                    if (err) {

                        return next(err);
                    }

                    req.session.destroy();
                    res.status(200).send({success: 'You have successfully logged out'});
                }
            );
    };

    this.activateRegistrationByEmail = function (req, res, next) {
        var secret = req.params.secret;

        if (!validator.isEmailSecret(secret)) {

            return res.status(401).send({fail: 'Wrong secret. Please, click on link in email'});
        }

        ActivateTokenModel
            .findOne({emailSecret: secret})
            .lean()
            .exec(function (err, token) {
                if (err) {

                    return next(err);
                }

                if (!token) {

                    return res.status(401).send({fail: 'Account already activated'});
                }

                ActivateTokenModel
                    .remove({emailSecret: secret}, function (err, result) {
                        if (err) {

                            return next(err);
                        }

                        res.status(200).send({success: 'You successfully activated register'});
                    });
            });
    };

    this.activateRegistrationByMobile = function (req, res, next) {
        var session = req.session || {};
        var body    = req.body    || {};
        var secret  = body.secret;
        var email   = session.email;

        if (!validator.isPhoneSecret(secret)) {

            return res.status(400).send({fail: 'Please, provide secret number from sms'});
        }

        if (!validator.isEmail(email)) {

            return res.status(401).send({fail: 'Please, login first'});
        }

        findModelByEmail(ActivateTokenModel, email, function (err, token) {
            if (err) {

                return next(err);
            }

            if (!token) {

                return res.status(401).send({fail: 'Account already activated'});
            }

            if (token.phoneSecret !== secret) {

                return res.status(400).send({fail: 'Wrong secret. Please check sms and provide number'});
            }

                ActivateTokenModel
                    .remove({phoneSecret: secret}, function (err, result) {
                        if (err) {

                            return next(err);
                        }

                        res.status(200).send({success: 'You successfully activated register'});
                    });
            });
    };

    this.provideActivationSecretToMobile = function (req, res, next) {
        var session = req.session || {};
        var email   = session.email;

        if (!validator.isEmail(email)) {

            return res.status(401).send({fail: 'Please, login firstly'});
        }

        findModelByEmail(UserModel, email, function (err, user) {
                if (err) {

                    return next(err);
                }

                if (!user) {

                    return res.status(401).send({fail: 'Please, register firstly'});
                }
                // check activation token
                findModelByEmail(ActivateTokenModel, email, function (err, token) {
                        if (err) {

                            return next(err);
                        }

                        if (!token) {

                            return res.status(401).send({fail: 'You already activated registration'});
                        }

                        twilio.sendSms(user.phone, token.phoneSecret, function (err, result) {
                            if (err) {

                                return next(err)
                            }

                            res.status(200).send({success: 'Please, check your mobile'})
                        });
                    });
            });
    };

    this.provideActivationSecretToEmail = function (req, res, next) {
        var session = req.session || {};
        var email   = session.email;

        if (!validator.isEmail(email)) {

            return res.status(401).send({fail: 'Please, login firstly'});
        }

        findModelByEmail(UserModel, email, function (err, user) {
            if (err) {

                return next(err);
            }

            if (!user) {

                return res.status(401).send({fail: 'Please, register firstly'});
            }

            findModelByEmail(ActivateTokenModel, email, function (err, token) {
                if (err) {

                            return next(err);
                        }

                if (!token) {

                    return res.status(401).send({fail: 'You already activated register'});
                }

                mailer.sendActivationLink(token.emailSecret, email, function (err, result) {
                    if (err) {

                        return next(err)
                    }

                    res.status(200).send({success: 'Please, check your email'})
                });
            });
        });
    };

    // Recovery
    this.useRecovery = function (req, res, next) {
        var body  = req.body;
        var email = body.email;

        if (!validator.isEmail(email)) {

            return res.status(400).send({fail: 'It is not email, please try again'});
        }

        findModelByEmail(UserModel, email, function (err, user) {
            if (err) {

                next(err);
            }

            if (!user) {

                return res.status(400).send({fail: 'Email not registered'});
            }

            new RecoveryTokenModel({
                phoneSecret: generator.generatePhoneSecret(),
                emailSecret: generator.generateEmailSecret(),
                email      : email
            }).save(function (err, result) {
                if (err) {

                    return next(err);
                }
                // add to session user's email
                req.session.email = email;

                res.status(200).send({success: 'Please, make choice'});
            });
        });
    };

    this.provideRecoverySecretToMobile = function (req, res, next) {
        var session = req.session || {};
        var email   = session.email;

        if (!validator.isEmail(email)) {

            return res.status(401).send({fail: 'Please, provide your email'});
        }

        findModelByEmail(UserModel, email, function(err, user) {
            if (err) {

                return next(err);
            }

            if (!user) {

                return res.status(401).send({fail: 'Account is not exist'});
            }

            findModelByEmail(RecoveryTokenModel, email, function(err, token) {
                if (err) {

                    return next(err);
                }

                if (!token) {

                    return res.status(401).send({fail: 'Please, use forgot your password link'})
                }

                twilio.sendSms(user.phone, token.phoneSecret, function (err, result) {
                    if (err) {

                        return next(err);
                    }

                    res.status(200).send({success: 'Please, check your phone'})
                });
            });
        });
    };

    this.provideRecoverySecretToEmail = function (req, res, next) {
        var session = req.session || {};
        var email   = session.email;

        if (!validator.isEmail(email)) {

            return res.status(401).send({fail: 'Please, provide email'});
        }

        findModelByEmail(RecoveryTokenModel, email, function(err, token) {
            if (err) {

                return next(err);
            }

            if (!token) {

                return res.status(401).send({fail: 'Please, use forgot password link provided in email'})
            }

            mailer.sendRecoveryLink(token.emailSecret, email, function (err, result) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: 'Please, check your mail'});
            });
        });
    };

    this.recoveryByMail = function (req, res, next) {
        var secret = req.params.secret;

        if (!validator.isEmailSecret(secret)) {

            return res.status(401).send({fail: 'Wrong link. Please, click on link in email'});
        }

        RecoveryTokenModel
            .findOne({emailSecret: secret})
            .lean()
            .exec(function (err, token) {
                if (err) {

                    return next(err);
                }

                if (!token) {

                    return res.status(401).send({fail: "You already used this link"});
                }

                res.status(200).send({success: 'Please set new password'});
            });
    };

    this.recoveryByMobile = function (req, res, next) {
        var session = req.session || {};
        var body    = req.body    || {};
        var secret = body.secret;
        var email  = session.email;

        if (!validator.isPhoneSecret(secret)) {

            return res.status(400).send({fail: 'Please, provide secret number from sms'});
        }

        if (!validator.isEmail(email)) {

            return res.status(401).send({fail: 'Please, use forgot your password link'});
        }

        findModelByEmail(RecoveryTokenModel, email, function(err, token) {
            if (err) {

                return next(err);
            }

            if (!token) {

                return res.status(401).send({fail: 'Please, use recovery'});
            }

            if (token.phoneSecret !== secret) {

                return res.status(400).send({fail: 'Wrong secret number. Please, try again'});
            }

            res.status(200).send({success: 'Please, set new password'});
        });
    };

    this.setNewPassword = function (req, res, next) {
        var session   = req.session || {};
        var body      = req.body    || {};
        var password  = body.password;
        var email     = session.email;

        if (!validator.isEmail(email)) {

            return res.status(401).send({fail: 'Please, use recovery'});
        }

        findModelByEmail(RecoveryTokenModel, email, function(err, token) {
            if (err) {

                return next(err);
            }

            if (!token) {

                return res.status(401).send({fail: 'Please, use recovery'});
            }

            if (!validator.isPassword(password)) {

                return res.status(400).send({fail: 'Please, provide new password'});
            }

            async.parallel([
                function (callback) {
                    RecoveryTokenModel
                        .remove({email: email}, function (err, result) {
                            return callback(err);
                        });
                },
                function (callback) {
                    UserModel
                        .update({email: email}, {$set: {password: coder.encryptPassword(password)}})
                        .exec(function (err, result) {
                            return callback(err, result);
                        });
                }
            ], function (err, result) {
                if (err) {

                    return next(err);
                }

                return res.status(200).send({success: 'You can use new password'});
            });
        });
    }
};

module.exports = AuthenticationHandler;
