'use strict';

define([
    'dater',
    'backbone',
    'validator',
    'underscore',
    'models/user',
    'text!templates/profile/profile.html',
    'text!templates/profile/editProfile.html',
    'text!templates/recovery/setNewPassword.html'
], function (dater,
             Backbone,
             validator,
             _,
             UserModel,
             profileTemplate,
             editProfileTemplate,
             setNewPasswordTemplate) {

    return Backbone.View.extend({
        el      : "#content",
        template: _.template(profileTemplate),

        initialize: function () {
            var self   = this;
            var userId = localStorage.getItem('userId');

            if (!userId) {

                alert('You should login firstly');
                return Backbone.history.navigate('#lullaby/login', {trigger: true});
            }

            new UserModel({_id: userId})
               .fetch({
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
            e.preventDefault();

            this.template = _.template(setNewPasswordTemplate);
            this.render();
        },

        onSetNewPassword: function (e) {
            var self = this;
            var confirmedPassword;
            var password;

            e.stopPropagation();
            e.preventDefault();

            confirmedPassword = this.$el.find('#confirmedPassword').val();
            password          = this.$el.find('#password').val();

            if (!password || !confirmedPassword) {

                return APP.notification('Please provide both passwords');
            }

            if (password !== confirmedPassword) {

                return APP.notification('Password not matched');
            }

            this.model.save({password: password}, {
                success: function (response) {
                    APP.notification(response.attributes.success);
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
            var userFile;

            e.stopPropagation();
            e.preventDefault();

            // get user's photo from form
            userFile = ( $('#userAvatar')[0].files[0] );

            if (validator.isImage(userFile)) {
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
                       APP.handleError(xhr);
                    }
                });
            }
        },

        onCancel: function (e) {
            e.preventDefault();

            changeAndRenderTemplate(profileTemplate);
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
            var userId;
            var email;
            var phone;
            var city;

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

            // grab user's updated data
            userData = {
                firstname: firstname,
                surname  : surname,
                street   : street,
                email    : email,
                phone    : phone,
                city     : city
            };

            userId = this.model.attributes._id;

            if (validator.isBirthday(birthday)) {
                userData.birthday = birthday;
            }

            new UserModel({_id: userId})
                .save(userData, {
                    success: function (response, xhr) {
                        self.template = _.template(profileTemplate);
                        self.render();
                    },
                    error  : function (err, xhr) {
                        APP.handlerError(xhr);
                    }
            });
        },

        render: function () {
            var userData     = this.model.attributes;
            var userBirthday = dater.formatDate(userData.birthday);

            this.$el.html(this.template({
                user    : userData,
                birthday: userBirthday
            }));

            return this;
        }
    });

    function changeAndRenderTemplate(template) {
        this.template = _.template(template);
        this.render();
    }
});