'use strict';

var ActivateTokenModel = require('../models/ActivateToken');
var RecoveryTokenModel = require('../models/RecoveryToken');
var UserModel          = require('../models/User');

var COOKIE_EXPIRE_DATE = require('../constants/magicNumbers');
var nodemailer         = require('nodemailer');
var validator          = require('validator');
var generator          = require('../helpers/generator');
var twilio             = require('../helpers/twilio');
var mailer             = require('../helpers/mailer');
var REGEX              = require('../constants/regExp');
var coder              = require('../helpers/coder');
var async              = require('async');

var AuthenticationHandler = function () {
    // access to routes
    this.onlyAuth = function (req, res, next) {
        if (req.session && req.session.loggedIn) {
            return next();
        }
        res.status(401).send();
    };

    this.onlyAdmin = function (req, res, next) {
        if (req.session && req.session.isAdmin) {
            return next();
        }
        res.status(401).send();
    };

    this.forAll = function (req, res, next) {
        return next();
    };

    // check user auth
    this.checkIsAuth = function (req, res, next) {
        var session = req.session || {};
        console.log(session);
        res.status(200).send(session);
    };

    // authentication
    function findUserByEmail(userEmail, callback) {
        UserModel
            .findOne({email: userEmail})
            .lean()
            .exec(function (err, user) {
                if (err) {

                    return callback(err);
                }

                return callback(null, user);
            })
    }

    this.signIn = function (req, res, next) {
        var body = req.body || {};
        var encryptPassword;
        var userPassword;
        var rememberMe;
        var userEmail;

        if (body.email && validator.isEmail(body.email)) {
            userEmail = body.email;
        }

        if (body.password && (typeof body.password === 'string') && body.password.trim().length) {
            userPassword = body.password;
        }

        if (body.rememberMe) {
            rememberMe = body.rememberMe;
        }

        if (userEmail && userPassword) {
            findUserByEmail(userEmail, function (err, user) {
                if (err) {

                    return next(err);
                }

                if (user) {
                    if (user.isBanned) {

                        return res.status(200).send({fail: 'User is banned'});
                    }
                    // check activation token
                    ActivateTokenModel
                        .findOne({userEmail: userEmail})
                        .lean()
                        .exec(function (err, token) {
                            if (err) {

                                return next(err);
                            }

                            if (!token) {
                                // encrypt profile inserted password
                                encryptPassword = coder.encryptPassword(userPassword);

                                if (user.password === encryptPassword) {
                                    // update user's last visit property
                                    UserModel
                                        .update({email: userEmail}, {$set: {lastVisit: new Date()}}, function(err, result) {
                                            if (err) {

                                                return next(err);
                                            }

                                            // add to session profile's data
                                            req.session.userName = user.firstname;
                                            req.session.loggedIn = true;
                                            req.session.userId = user._id;

                                            if (rememberMe) {

                                                req.session.cookie.maxAge = COOKIE_EXPIRE_DATE.ONE_MONTH;
                                                req.session.rememberMe = true;
                                            } else {

                                                req.session.cookie.expires = false;
                                            }

                                            if (user.isAdmin) {

                                                req.session.isAdmin = true;
                                            }

                                            delete user.password;

                                            return res.status(200).send(user);
                                        })
                                } else {

                                    return res.status(200).send({fail: 'Wrong password...Please, try again'});
                                }
                            } else {

                                return res.status(200).send({fail: 'Account not activated yet. Please, activate it'});
                            }
                        });
                } else {

                    return res.status(200).send({fail: 'Account is not registered. Please, sign up'});
                }
            });
        } else {

            return res.status(403).send({fail: 'Bad credentials'});
        }
    };

    this.signUp = function (req, res, next) {
        var body = req.body || {};
        var confirmedPassword;
        var firstname;
        var userEmail;
        var password;
        var surname;
        var gender;
        var phone;

        if (body.email && (typeof body.email === 'string') && validator.isEmail(body.email)) {
            userEmail = body.email;
        }

        if (body.password && (typeof body.password === 'string') && body.password.trim().length) {
            password = body.password;
        }

        if (body.confirmedPassword && (typeof body.confirmedPassword === 'string') && body.confirmedPassword.trim().length) {
            confirmedPassword = body.confirmedPassword;
        }

        if (body.phone && body.phone.match(REGEX.MOBILE_VALID)) {
            phone = body.phone;
        }

        if (body.firstname && (typeof body.firstname === 'string') && body.firstname.trim().length) {
            firstname = body.firstname;
        }

        if (body.surname && (typeof body.firstname === 'string') && body.surname.trim().length) {
            surname = body.surname;
        }

        if (body.gender) {
            gender = body.gender;
        }

        if (userEmail && password && confirmedPassword && gender && surname && firstname && phone) {
            findUserByEmail(userEmail, function (err, user) {
                var encryptPassword;
                var activateToken;
                var newUser;

                if (err) {

                    return next(err);
                }

                if (!user) {
                    if (password === confirmedPassword) {
                        // encrypt profile inserted password
                        encryptPassword = coder.encryptPassword(password);

                        newUser = new UserModel({
                            password: encryptPassword,
                            firstname: firstname,
                            email    : userEmail,
                            surname  : surname,
                            gender   : gender,
                            phone    : phone
                        });

                        activateToken = new ActivateTokenModel({
                            emailSecret: generator.generateEmailSecret(),
                            phoneSecret: generator.generatePhoneSecret(),
                            userEmail  : userEmail
                        });

                        async.parallel([
                                function (callback) {
                                    newUser.save(function (err, result) {
                                        return callback(err, result);
                                    });
                                },
                                function (callback) {
                                    activateToken.save(function (err, result) {
                                        return callback(err, result);
                                    });

                                }],
                            function (err, result) {
                                if (err) {

                                    return next(err);
                                }

                                return res.status(200).send({success: true});
                            });
                    } else {

                        return res.status(200).send({fail: 'Passwords are not matched. Please, try again'});
                    }
                } else {
                    return res.status(200).send({fail: 'Nope...Email has already registered'});

                }
            });
        } else {

            return res.status(403).send({fail: 'Bad credentials'});
        }
    };

    this.signOut = function (req, res, next) {
        req.session.destroy();

        res.status(200).send({success: true});
    };

    this.activateRegistrationByEmail = function (req, res, next) {
        var body = req.body || {};
        var secret;

        if (body.secret && (typeof body.secret === 'string') && body.secret.trim().length) {
            secret = body.secret;
        }

        if (secret) {
            ActivateTokenModel
                .remove({emailSecret: body.secret}, function (err, result) {
                    if (err) {

                        return next(err);
                    }
                    res.status(200).send({success: true});
                });
        } else {
            res.status(200).send({fail: 'Wrong token secret'});
        }
    };

    this.activateRegistrationByMobile = function (req, res, next) {
        var body = req.body || {};
        var secret;

        if (body.secret && (typeof body.secret === 'string') && body.secret.trim().length) {
            secret = body.secret;
        }

        if (secret) {
            ActivateTokenModel
                .remove({phoneSecret: body.secret}, function (err, result) {
                    if (err) {

                        return next(err);
                    }
                    res.status(200).send({success: true});
                });
        } else {
            res.status(200).send({fail: 'Wrong token secret'});
        }
    };

    this.provideActivationSecretToMobile = function (req, res, next) {
        var body = req.body || {};
        var userEmail;
        var error;

        if (body.email) {
            userEmail = body.email;

            async.waterfall([
                // try to find profile in bd
                function (callback) {
                    UserModel
                        .findOne({email : userEmail})
                        .lean()
                        .exec(function (err, user) {
                            return callback(err, user);
                        })
                },
                // try to find activation token in bd
                function (user, callback) {
                    ActivateTokenModel
                        .findOne({userEmail: user.email})
                        .lean()
                        .exec(function (err, token) {
                            return callback(err, user, token)
                        })
                },
                // send to profile sms with activation number
                function (user, token, callback) {
                    twilio.sendSms(user.phone, token.phoneSecret, function (err, result) {
                        callback(err, result);
                    });
                }
            ], function (err, result) {
                if (err) {

                    return callback(err);
                }

                res.status(200).send({success: true});
            })
        } else {
            res.status(200).send({fail: 'Wrong incoming params. Some internal error'});
        }
    };

    this.provideActivationSecretToEmail = function (req, res, next) {
        var body = req.body || {};
        var userEmail;

        if (body.email && validator.isEmail(body.email)) {
            userEmail = body.email;

            async.waterfall([
                // try to find profile in bd
                function (callback) {
                    UserModel
                        .findOne({email : userEmail})
                        .lean()
                        .exec(function (err, user) {
                            return callback(err, user);
                        })
                },
                // try to find activation token in bd
                function (user, callback) {
                    ActivateTokenModel
                        .findOne({userEmail: user.email})
                        .lean()
                        .exec(function (err, token) {
                            return callback(err, user, token)
                        })
                },
                // send to profile sms with activation number
                function (user, token, callback) {
                    mailer.sendActivationLink(token.emailSecret, user.email, function (err, result) {
                        callback(err, result);
                    });
                }
            ], function (err, result) {
                if (err) {

                    return callback(err);
                }

                res.status(200).send({success: true});
            });
        } else {

            // if no profile email
            res.status(200).send({fail: 'Some internal problem.'});
        }
    };

    // Recovery
    this.useRecovery = function (req, res, next) {
        var body = req.body;
        var email;

        if (body.email && (typeof body.email === 'string') && validator.isEmail(body.email)) {
            email = body.email;
        }

        if (email) {
            UserModel
                .findOne({email: email})
                .lean()
                .exec(function (err, user) {
                    if (err) {

                        next(err);
                    }
                    if (user) {
                        // create recovery token and save it in bd
                        new RecoveryTokenModel({
                            userEmail  : email,
                            emailSecret: generator.generateEmailSecret(),
                            phoneSecret: generator.generatePhoneSecret()
                        }).save(function (err, result) {
                            if (err) {

                                return next(err);
                            }

                            res.status(200).send({success: true});
                        });
                    } else {

                        return res.status(200).send({fail: 'Email not registered'});
                    }
                });
        } else {

            return res.status(200).send({fail: 'Please, specify email'});
        }
    };

    this.provideRecoverySecretToMobile = function (req, res, next) {
        var body = req.body || {};
        var userEmail;

        if (body.email && (typeof body.email === 'string') && validator.isEmail(body.email)) {
            userEmail = body.email;
        }

        if (userEmail) {
            async.waterfall([
                function (callback) {
                    UserModel
                        .findOne({email: userEmail})
                        .lean()
                        .exec(function (err, user) {
                            return callback(err, user);
                        })
                },
                function (user, callback) {
                    RecoveryTokenModel
                        .findOne({userEmail: userEmail})
                        .lean()
                        .exec(function (err, token) {
                            return callback(err, user, token)
                        })
                },
                function (user, token, callback) {
                    twilio.sendSms(user.phone, token.phoneSecret, function (err, result) {
                        callback(null);
                    });
                }],
            function (err) {
                if (err) {

                    return next(err);
                }

                res.status(200).send({success: true});
            })
        } else {

            res.status(200).send({fail: 'No email to provide recovery secret'});
        }
    };

    this.provideRecoverySecretToEmail = function (req, res, next) {
        var body = req.body || {};
        var userEmail;

        if (body.email && (typeof body.email === 'string') && validator.isEmail(body.email)) {
            userEmail = body.email;
        }

        if (userEmail) {
            async.waterfall([
                function (callback) {
                    UserModel
                        .findOne({email: userEmail})
                        .lean()
                        .exec(function (err, user) {
                            return callback(err, user);
                        })
                },
                function (user, callback) {
                    RecoveryTokenModel
                        .findOne({userEmail: userEmail})
                        .lean()
                        .exec(function (err, token) {
                            return callback(err, token)
                        })
                },
                function (token, callback) {
                    mailer.sendRecoveryLink(token.emailSecret, userEmail, function (err, result) {
                        callback(err, result);
                    });
                }],
            function (err, result) {
                if (err) {

                    return callback(err);
                }

                res.status(200).send({success: true});
            });
        } else {

            res.status(200).send({fail: 'No email to provide recovery secret'});
        }
    };

    this.recoveryByMail = function (req, res, next) {
        var body = req.body || {};
        var secret;

        if (body.secret && (typeof body.secret === 'string') && body.secret.trim().length) {
            secret = body.secret;
        }

        if (secret) {
            RecoveryTokenModel
                .findOne({emailSecret: secret})
                .lean()
                .exec(function (err, token) {
                    if (err) {

                        return next(err);
                    }

                    if (token) {
                        token.remove(function (err, result) {
                            if (err) {

                                return next(err);
                            }

                            res.status(200).send({success: true});
                        });
                    } else {

                        return res.status(200).send({fail: "Account already activated or doesn't exist"});
                    }
                });
        } else {

            return res.status(200).send({fail: 'Not fount recovery secret'});
        }
    };

    this.recoveryByMobile = function (req, res, next) {
        var body = req.body || {};
        var secret;

        if (body.secret) {
            secret = body.secret;
        }

        if (secret) {
            RecoveryTokenModel
                .findOne({phoneSecret: body.secret})
                .lean()
                .exec(function (err, token) {
                    if (err) {

                        return next(err);
                    }

                    if (token) {

                        res.status(200).send({success: true});
                    } else {

                        res.status(200).send({fail: "Account already activated or doesn't exist"});
                    }
                });
        } else {

            res.status(200).send({fail: "Please provide secret number"});
        }
    };

    this.setNewPassword = function (req, res, next) {
        var body = req.body || {};
        var password;
        var email;

        if (body.password) {
            password = body.password;
        }

        if (body.email && (typeof body.email === 'string') && validator.isEmail(body.email)) {
            email = body.email;
        }

        if (password && email) {
                async.parallel([
                    function (callback) {
                        UserModel
                            .update({email: email}, {password: coder.encryptPassword(password)})
                            .exec(function (err, result) {
                                return callback(err, result);
                            });
                    },
                    function (callback) {
                        RecoveryTokenModel
                            .remove({userEmail: email}, function (err, result) {
                                return callback(err);
                            });
                    }],
                function (err, result) {
                    if (err) {

                        return next(err);
                    }

                    return res.status(200).send({success: true});
                });
        } else {

            return res.status(200).send({fail: 'Please provide passwords. Fill both fields'});
        }
    }
};

module.exports = AuthenticationHandler;
