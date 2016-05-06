'use strict';

define(
    function () {
        var phoneRegExp = /^\+\d{2}\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
        var emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var skypeRegExp = /^[\w\._@]{6,100}$/;
        var  nameRegExp = /^[a-zA-Z]+[a-zA-Z-_\s]+$/;

        var validateEmail = function (email) {
            return email.match(emailRegExp);
        };

        var validatePhone = function (phone) {
            return phone.match(phoneRegExp);
        };

        var validateBirthday = function (date) {
            return date.trim().length;
        };

        var validateImage = function (image) {
            if (!image) {
                alert('You did not attach any file. Please, select image');

                return false;
            }

            if (image.size > Image.MAX_SIZE) {
                alert('too big file size (max size <= 300KB). Please, try again');

                return false;
            }

            if (!image.type.match('image.*')) {
                alert('You uploaded not image. Please, try again');

                return false;
            }

            return true;
        };


        return {
            validateBirthday: validateBirthday,
            validateEmail   : validateEmail,
            validatePhone   : validatePhone,
            validateImage   : validateImage
        }
    });