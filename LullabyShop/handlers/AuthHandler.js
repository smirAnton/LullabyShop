'use strict';

var ActivateTokenModel = require('../models/ActivateToken');
var RecoveryTokenModel = require('../models/RecoveryToken');
var UserModel          = require('../models/User');

var validator          = require('validator');
var async              = require('async');

var cookieLifeTime     = require('../constants/magicNumbers');
var generator          = require('../helpers/generator')();
var twilio             = require('../helpers/twilio')();
var logger             = require('../helpers/logger')(module);
var regExp             = require('../constants/regExp');
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

    this.login = function (req, res, next) {
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

        // validate user's incoming data
        if (!userEmail || !userPassword) {

            return res.status(422).send({fail: 'Nope...Please, provide email and password'});
        }

        findUserByEmail(userEmail, function (err, user) {
            if (err) {

                return next(err);
            }
            // check if email already registered
            if (!user) {

                return res.status(404).send({fail: 'Email is not registered. Please, register'});
            }
            // check if user is banned
            if (user.isBanned) {

                return res.status(403).send({fail: 'Sorry, you have been banning'});
            }
            // check if user activate registration
            ActivateTokenModel
                .findOne({userEmail: userEmail}, {__v: 0})
                .lean()
                .exec(function (err, token) {
                    if (err) {

                        return next(err);
                    }
                    // check if confirmed registration
                    if (token) {
                        // add to session userEmail
                        req.session.userEmail = userEmail;

                        return res.status(401).send({fail: 'Account is not activated. Please, activate'});
                    }

                    // encrypt profile inserted password
                    encryptPassword = coder.encryptPassword(userPassword);

                    if (user.password !== encryptPassword) {

                        return res.status(400).send({fail: 'Wrong password...Please, try again'});
                    }

                    if (rememberMe) {
                        req.session.cookie.maxAge = cookieLifeTime.ONE_MONTH;
                        req.session.rememberMe = true;

                    } else {
                        req.session.cookie.expires = false;

                    }

                    if (user.isAdmin) {
                        req.session.isAdmin = true;
                    }

                    delete user.password;

                    // add to session user data
                    req.session.loggedIn  = true;
                    req.session.userName  = user.firstname;
                    req.session.userEmail = user.email;
                    req.session.userPhone = user.phone;
                    req.session.userId    = user._id;

                    return res.status(200).send(user);
                })
        });

    };

    this.register = function (req, res, next) {
        var body = req.body || {};
        var confirmedPassword;
        var firstname;
        var password;
        var surname;
        var gender;
        var phone;
        var email;

        if (body.email && (typeof body.email === 'string') && validator.isEmail(body.email)) {
            email = body.email;
        }

        if (body.password && (typeof body.password === 'string') && body.password.trim().length) {
            password = body.password;
        }

        if (body.confirmedPassword && (typeof body.confirmedPassword === 'string') && body.confirmedPassword.trim().length) {
            confirmedPassword = body.confirmedPassword;
        }

        if (body.phone && body.phone.match(regExp.PHONE)) {
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

        if (!email || !password || !confirmedPassword || !gender || !surname || !firstname || !phone) {

            return res.status(422).send({fail: 'Please provide correct data'});
        }

        findUserByEmail(email, function (err, user) {
            var encryptPassword;
            var activationToken;
            var newUser;

            if (err) {

                return next(err);
            }
            // check if email is already registered
            if (user) {

                return res.status(409).send({fail: 'This email is already registered. Please provide another one'});
            }
            // check if passwords are matched
            if (password !== confirmedPassword) {

                return res.status(400).send({fail: 'Passwords are not matched. Please, try again'});
            }
            // encrypt password provided by user to compare with pass in db
            encryptPassword = coder.encryptPassword(password);

            newUser = new UserModel({
                firstname: firstname,
                password : encryptPassword,
                surname  : surname,
                gender   : gender,
                phone    : phone,
                email    : email
            });

            activationToken = new ActivateTokenModel({
                emailSecret: generator.generateEmailSecret(),
                phoneSecret: generator.generatePhoneSecret(),
                userEmail  : email
            });

            // add to session user data
            req.session.userEmail = email;
            req.session.userPhone = phone;

            async.parallel([
                function (callback) {
                    newUser.save(function (err, result) {
                        return callback(err, result);
                    });
                },
                function (callback) {
                    activationToken.save(function (err, result) {
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
        var session   = req.session || {};
        var userEmail = session.userEmail;
        var userId    = session.userId;

        if (!userId || !userEmail || !validator.isMongoId(userId) || !validator.isEmail(userEmail)) {

            return res.status(401).send({fail: 'You should login firstly'});
        }

        UserModel
            .update(
                {email: userEmail},
                {$set : {lastVisit: new Date()}},
                function (err, updatedUser) {
                    if (err) {

                        return next(err);
                    }
                    req.session.destroy();
                    res.status(200).send({success: 'You have successfully logged out'});
                });
    };

    this.activateRegistrationByEmail = function (req, res, next) {
        var secret = req.params.secret;

        if (!secret || !(typeof secret === 'string') || !secret.trim().length) {

            return res.status(400).send({fail: 'Wrong secret. Please, click on link in email'});
        }

        ActivateTokenModel
            .findOne({emailSecret: secret})
            .lean()
            .exec(function (err, token) {
                if (err) {

                    return next(err);
                }

                if (!token) {

                    return res.status(404).send({fail: 'Account has already activated'});
                }

                ActivateTokenModel
                    .remove({emailSecret: secret}, function (err, result) {
                        if (err) {

                            return next(err);
                        }

                        res.status(200).send({success: 'You successfully activated registration'});
                    });
            });
    };

    this.activateRegistrationByMobile = function (req, res, next) {
        var body   = req.body || {};
        var secret = body.secret;

        if (!secret || !(typeof secret === 'string') || !secret.trim().length) {

            return res.status(422).send({fail: 'Please, provide secret number'});
        }

        ActivateTokenModel
            .findOne({phoneSecret: secret})
            .lean()
            .exec(function (err, token) {
                if (err) {

                    return next(err);
                }

                if (!token) {

                    return res.status(404).send({fail: 'Wrong secret number. Please, provide number in sms'});
                }

                ActivateTokenModel
                    .remove({phoneSecret: secret}, function (err, result) {
                        if (err) {

                            return next(err);
                        }

                        res.status(200).send({success: 'You successfully activated registration'});
                    });
            });
    };

    this.provideActivationSecretToMobile = function (req, res, next) {
        var session   = req.session || {};
        var userEmail = session.userEmail;
        var userPhone = session.userPhone;

        if (!userEmail || !validator.isEmail(userEmail) || !userPhone || !userPhone.match(regExp.MOBILE_VALID)) {

            return res.status(403).send({fail: 'Please, login firstly'});
        }
        // check user in db
        UserModel
            .findOne({email: userEmail}, {__v: 0})
            .lean()
            .exec(function (err, user) {
                if (err) {

                    return next(err);
                }

                if (!user) {

                    return res.status(404).send({fail: 'Please, register firstly'});
                }
                // check activation token
                ActivateTokenModel
                    .findOne({userEmail: userEmail}, {__v: 0})
                    .lean()
                    .exec(function (err, token) {
                        if (err) {

                            return next(err);
                        }

                        if (!token) {

                            return res.status(409).send({fail: 'You have already activated registration'});
                        }

                        twilio.sendSms(user.phone, token.phoneSecret, function (err, result) {
                            if (err) {

                                return next(err)
                            }

                            res.status(200).send({success: 'Please check your mobile'})
                        });
                    });
            });
    };

    this.provideActivationSecretToEmail = function (req, res, next) {
        var session   = req.session || {};
        var userEmail = session.userEmail;

        if (!userEmail || !validator.isEmail(userEmail)) {

            return res.status(403).send({fail: 'Please, login firstly'});
        }

        // check user in db
        UserModel
            .findOne({email: userEmail}, {__v: 0})
            .lean()
            .exec(function (err, user) {
                if (err) {

                    return next(err);
                }

                if (!user) {

                    return res.status(404).send({fail: 'Please, register firstly'});
                }
                // check activation token
                ActivateTokenModel
                    .findOne({userEmail: userEmail}, {__v: 0})
                    .lean()
                    .exec(function (err, token) {
                        if (err) {

                            return next(err);
                        }

                        if (!token) {

                            return res.status(409).send({fail: 'You have already activated registration'});
                        }

                        mailer.sendActivationLink(token.emailSecret, userEmail, function (err, result) {
                            if (err) {

                                return next(err)
                            }

                            res.status(200).send({success: 'Please check your email'})
                        });
                    });
            });
    };

    // Recovery
    this.useRecovery = function (req, res, next) {
        var body  = req.body;
        var email = body.email;
        var recoveryToken;

        if (!email || !validator.isEmail(body.email)) {

            return res.status(422).send({fail: 'Please, provide email'});
        }

        UserModel
            .findOne({email: email})
            .lean()
            .exec(function (err, user) {
                if (err) {

                    next(err);
                }
                if (!user) {

                    return res.status(404).send({fail: 'Email not registered'});
                }

                recoveryToken = new RecoveryTokenModel({
                    userEmail  : email,
                    emailSecret: generator.generateEmailSecret(),
                    phoneSecret: generator.generatePhoneSecret()
                });

                recoveryToken.save(function (err, result) {
                    if (err) {

                        return next(err);
                    }

                    // add to session user's email
                    req.session.userEmail = email;

                    res.status(200).send({success: true});
                });

            });

    };

    this.provideRecoverySecretToMobile = function (req, res, next) {
        var session   = req.session || {};
        var userEmail = session.userEmail;

        if (!userEmail || !validator.isEmail(userEmail)) {

            return res.status(404).send({fail: 'Please provide email'});
        }

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
            }
        ], function (err) {
            if (err) {

                return next(err);
            }

            res.status(200).send({success: 'Please check your mobile'});
        })
    };

    this.provideRecoverySecretToEmail = function (req, res, next) {
        var session   = req.session || {};
        var userEmail = session.userEmail;

        if (!userEmail || !validator.isEmail(userEmail)) {

            return res.status(404).send({fail: 'Please provide email'});
        }

        async.waterfall([
            function (callback) {
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
            }
        ], function (err, result) {
            if (err) {

                return callback(err);
            }

            res.status(200).send({success: 'Please check your mail'});
        });

    };

    this.recoveryByMail = function (req, res, next) {
        var secret = req.params.secret;

        if (!secret || !(typeof secret === 'string') || !secret.trim().length) {

            return res.status(400).send({fail: 'Wrong link. Please click on link in email'});
        }

        RecoveryTokenModel
            .findOne({emailSecret: secret})
            .lean()
            .exec(function (err, token) {
                if (err) {

                    return next(err);
                }

                if (!token) {

                    return res.status(403).send({fail: "You has already used this link"});
                }

                RecoveryTokenModel
                    .remove({emailSecret: secret}, function (err, result) {
                    if (err) {

                        return next(err);
                    }

                    res.status(200).send({success: 'Please set new password'});
                });
            });
    };

    this.recoveryByMobile = function (req, res, next) {
        var body         = req.body || {};
        var secretNumber = body.secretNumber;

        if (!secretNumber) {

            return res.status(422).send({fail: "Please provide secret number"});
        }

        RecoveryTokenModel
            .findOne({phoneSecret: secretNumber})
            .lean()
            .exec(function (err, token) {
                if (err) {

                    return next(err);
                }

                if (!token) {

                    return res.status(403).send({fail: "Wrong secret number. Please provide from sms"});
                }

                res.status(200).send({success: 'Please set new password'});
            });
    };

    this.setNewPassword = function (req, res, next) {
        var session   = req.session || {};
        var body      = req.body || {};
        var password  = body.password;
        var userEmail = session.userEmail;
        var newPassword;

        if (!userEmail || !validator.isEmail(userEmail)) {

            return res.status(403).send({fail: 'Please provide email firstly'});
        }

        if (!password) {

            return res.status(422).send({fail: 'Please provide new password'});
        }

        newPassword = coder.encryptPassword(password);

        async.parallel([
                function (callback) {
                    RecoveryTokenModel
                        .remove({userEmail: userEmail}, function (err, result) {
                            return callback(err);
                        });
                },
                function (callback) {
                    UserModel
                        .update({email: userEmail}, {$set: {password: newPassword}})
                        .exec(function (err, result) {
                            return callback(err, result);
                        });
                }],
            function (err, result) {
                if (err) {

                    return next(err);
                }

                return res.status(200).send({success: 'New password successfully updated'});
            });

    }
};

module.exports = AuthenticationHandler;
