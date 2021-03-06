'use strict';

define(['underscore'],
    function (_) {
        var phoneSecretRegExp = /\d{4}/;
        var digitsRegExp      = /^[0-9]/;
        var skypeRegExp       = /^[\w\._@]{6,100}$/;
        var phoneRegExp       = /^\+\d{2}\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
        var emailRegExp       = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var dateRegExp        = /^\d{2}\/\d{2}\/\d{4}$/;
        var nameRegExp        = /^[a-zA-Z]+[a-zA-Z-_\s]+$/;

        function isPassword (password) {
            if (!password || !password.trim().length) {

                return 'Password can not be empty. Please, try again'
            }
        }

        function isEmail(email) {

           return email.match(emailRegExp) ? '' : 'Not email. Please, try again';
        }

        function isMobile(phone) {
            if (!phone.match(phoneRegExp)) {

                return 'Not mobile number. Please, try again'
            }
        }

        function isBirthday(date) {
            if (!date.match(dateRegExp)) {

                return 'Not date. Please, try again';
            }
        }

        function isImage(image) {
            if (!image) {

                return 'You did not attach any file. Please, select image';
            }

            if (image.size > Image.MAX_SIZE) {

                return 'too big file size (max size <= 300KB). Please, try again';
            }

            if (!image.type.match('image.*')) {

                return 'You uploaded not image. Please, try again';
            }
        }

        function isPhoneSecret(secret) {
            if (!secret.match(phoneSecretRegExp)) {

                return 'Secret number should consist of four digits';
            }
        }

        function isMatchedPasswords(pass, confPass) {
            if (pass !== confPass) {

                return 'Passwords not matched. Please, try again';
            }
        }

        function isPositiveDigit(value) {

            return value && !_.isNaN(parseInt(value)) && value < 0
        }

        function isComment(comment) {
            if (!comment && comment.trim().length) {

                return 'Please, provide comment';
            }
        }


        return {
            isMatchedPasswords: isMatchedPasswords,
            isPositiveDigit   : isPositiveDigit,
            isPhoneSecret     : isPhoneSecret,
            isBirthday        : isBirthday,
            isPassword        : isPassword,
            isComment         : isComment,
            isMobile          : isMobile,
            isEmail           : isEmail,
            isImage           : isImage
        }
    }
);