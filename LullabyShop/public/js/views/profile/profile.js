'use strict';

define([
    'dater',
    'constant',
    'backbone',
    'validator',
    'underscore',
    'models/user',
    'text!templates/profile/profile.html',
    'text!templates/profile/editProfile.html',
    'text!templates/profile/changePassword.html'
], function (dater, constant, Backbone, validator, _, UserModel, profileTemplate, editProfileTemplate, changePasswordTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(profileTemplate),

        initialize: function () {
            var self = this;

            new UserModel({_id: APP.session.userId})
               .fetch({
                    success: function (response) {
                        self.cities = constant.autocompletes.CITIES;
                        self.model  = response.attributes;
                        self.render();
                    },
                    error  : function (err, xhr) {
                        APP.handleError(xhr);
                    }
               });
        },

        events: {
            'click #changePasswordBtn': 'onChangePassword',
            'click #setNewPasswordBtn': 'onSetNewPassword',
            'click #uploadAvatarBtn'  : 'onUploadAvatar',
            'click #cancelBtn'        : 'onCancel',
            'click #editBtn'          : 'onEdit',
            'click #saveBtn'          : 'onSave'
        },

        onChangePassword: function (e) {
            e.preventDefault();

            this.template = _.template(changePasswordTemplate);
            this.render();
        },

        onSetNewPassword: function (e) {
            var self               = this;
            var $confirmedPassword = this.$el.find('#confirmedPassword');
            var confirmedPassword;
            var password;
            var fail;

            e.stopPropagation();
            e.preventDefault();

            confirmedPassword = $confirmedPassword.val();
            password          = this.$el.find('#password').val();

            if (fail = validator.isPassword(password)                            ||
                       validator.isPassword(confirmedPassword)                   ||
                       validator.isMatchedPasswords(password, confirmedPassword)) {

                return APP.showErrorAlert(fail);
            }

            new UserModel({_id: APP.session.userId})
                .save({password: password}, {
                    success: function (response) {
                        APP.showSuccessAlert(response.attributes.success);
                        self.template = _.template(profileTemplate);
                        self.render();
                    },
                    error  : function (err, xhr) {
                        APP.handlerError(xhr);
                    }
            });
        },

        onUploadAvatar: function (e) {
            var self = this;
            var formData;
            var image;
            var fail;

            e.stopPropagation();
            e.preventDefault();

            image = this.$el.find('#userAvatar')[0].files[0];

            if (fail = validator.isImage(image)) {

                return APP.showErrorAlert(fail);
            }

            formData = new FormData();
            formData.set('attachment', image);

            $.ajax({
                type       : 'POST',
                url        : '/lullaby/user/upload',
                data       : formData,
                processData: false,
                contentType: false,
                success    : function (response) {
                    self.template = _.template(profileTemplate);
                    self.initialize();
                },
                error      : function (xhr) {
                    APP.handleError(xhr);
                }
            });
        },

        onCancel: function (e) {
            e.preventDefault();

            this.template = _.template(profileTemplate);
            this.render();
        },

        onEdit: function (e) {
            e.preventDefault();

            this.template = _.template(editProfileTemplate);
            this.render();
        },

        onSave: function (e) {
            var self = this;
            var firstname;
            var userData;
            var birthday;
            var surname;
            var street;
            var email;
            var phone;
            var city;
            var fail;

            e.stopPropagation();
            e.preventDefault();

            firstname = this.$el.find('#firstName').val();
            birthday  = this.$el.find('#birthday').val();
            surname   = this.$el.find('#surname').val();
            street    = this.$el.find('#street').val();
            email     = this.$el.find('#email').val();
            phone     = this.$el.find('#phone').val();
            city      = this.$el.find('#city').val();

            if (fail = validator.isEmail(email)       ||
                       validator.isMobile(phone)      ||
                       validator.isBirthday(birthday)) {

                return APP.showErrorAlert(fail);
            }

            userData = {
                firstname: firstname,
                birthday : birthday,
                surname  : surname,
                street   : street,
                email    : email,
                phone    : phone,
                city     : city
            };

            new UserModel({_id: APP.session.userId})
                .save(userData, {
                   success: function () {
                       self.template = _.template(profileTemplate);
                       self.initialize();
                   },
                   error  : function (err, xhr) {
                       APP.handlerError(xhr);
                   }
                });
        },

        render: function () {
            this.$el.html(this.template({
                dater : dater,
                cities: this.cities,
                user  : this.model
            }));

            return this;
        }
    });
});