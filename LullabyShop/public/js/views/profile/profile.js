'use strict';

define([
    'backbone',
    'validator',
    'underscore',
    'models/user',
    'text!templates/profile/profile.html',
    'text!templates/profile/editProfile.html',
    'text!templates/recovery/setNewPassword.html'
], function (Backbone, validator, _, UserModel, profileTemplate, editProfileTemplate, setNewPasswordTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(profileTemplate),

        initialize: function () {
            var self = this;
            var userId;
            var user;

            userId = localStorage.getItem('userId');
            if (!userId) {

                alert('You should login firstly');
                return Backbone.history.navigate('#lullaby/login', {trigger: true});
            }

            user = new UserModel({_id: userId});
            user.fetch({
                success: function (response) {
                    self.model = response;
                    self.render();
                },
                error  : function (err, xhr) {
                    self.handleError(xhr);
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
            e.stopPropagation();
            e.preventDefault();

            this.template = _.template(setNewPasswordTemplate);
            this.render();
        },

        onSetNewPassword: function (e) {
            var self = this;
            var confirmedPassword;
            var password;
            var user;

            e.stopPropagation();
            e.preventDefault();

            confirmedPassword = this.$el.find('#confirmedPassword').val();
            password          = this.$el.find('#password').val();

            if (!password || !confirmedPassword) {

                return alert('Please provide both passwords');
            }

            if (password !== confirmedPassword) {

                return alert('Password not matched');
            }

            user = self.model;
            user.save({password: password}, {
                success: function (response) {
                    alert(response.attributes.success);
                    self.template = _.template(profileTemplate);
                    self.render();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        onUploadAvatar: function (e) {
            var self = this;
            var formData;
            var userFile;

            e.stopPropagation();
            e.preventDefault();

            // get user's photo from form
            userFile = ( $('#userAvatar')[0].files[0] );

            if (validator.validateImage(userFile)) {
                formData = new FormData();
                formData.set('attachment', userFile);

                $.ajax({
                    url        : 'lullaby/user/upload',
                    type       : 'POST',
                    data       : formData,
                    processData: false,
                    contentType: false,
                    success    : function (response) {
                        self.template = _.template(profileTemplate);
                        self.initialize();
                    },
                    error      : function (xhr) {
                       self.handleError(xhr);
                    }
                });
            }
        },

        onCancel: function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.template = _.template(profileTemplate);
            this.render();
        },

        onEdit: function (e) {
            e.stopPropagation();
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
            var user;

            e.stopPropagation();
            e.preventDefault();

            firstname = this.$el.find('#firstName').val();
            birthday  = this.$el.find('#birthday').val();
            surname   = this.$el.find('#surname').val();
            street    = this.$el.find('#street').val();
            email     = this.$el.find('#email').val();
            phone     = this.$el.find('#phone').val();
            city      = this.$el.find('#city').val();

            if (!validator.validateEmail(email)) {

                return alert('Nope...Please, provide email');
            }

            if (!validator.validatePhone(phone)) {

                return alert('Nope...Please, provide phone number');
            }

            userData = {
                firstname: firstname,
                surname  : surname,
                street   : street,
                email    : email,
                phone    : phone,
                city     : city
            };

            if (validator.validateBirthday(birthday)) {

                userData.birthday = birthday;
            }


            user = self.model;
            user.save(userData, {
                success: function (response) {
                    self.template = _.template(profileTemplate);
                    self.render();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        handleError: function (xhr) {
            switch (xhr.status) {
                case 400: // bad request
                    alert(xhr.responseJSON.fail);
                    break;

                case 401: // user not authorized
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/login', {trigger: true});
                    break;

                case 403: // can not delete yourself (account)
                    alert(xhr.responseJSON.fail);
                    break;

                case 404: // not found
                    alert(xhr.responseJSON.fail);
                    Backbone.history.navigate('#lullaby/shop', {trigger: true});
                    break;

                case 422: // wrong incoming data
                    alert(xhr.responseJSON.fail);
                    break;

                default:
                    break;
            }
        },

        render: function () {
            this.$el.html(this.template({user: this.model.attributes}));

            return this;
        }
    });

    return View;
});