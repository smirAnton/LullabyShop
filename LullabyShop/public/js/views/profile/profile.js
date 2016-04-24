'use strict';

define([
    'backbone',
    'underscore',
    'models/user',
    'text!templates/profile/profile.html',
    'text!templates/profile/editProfile.html',
    'text!templates/recovery/setNewPassword.html'
], function (Backbone, _, UserModel, profileTemplate, editProfileTemplate, setNewPasswordTemplate) {
    var View = Backbone.View.extend({
        el      : "#content",
        template: _.template(profileTemplate),

        initialize: function () {
            var self = this;
            var userId;
            var user;
            // get user id from local storage
            userId = localStorage.getItem('userId');

            if (!userId) {

                return alert('Nope...you should loggedIn first');
            }

            user = new UserModel({_id : userId});
            self.model = user;

            user.fetch({
                success: function () {
                    self.render();
                },

                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        events: {
            'click #changePasswordBtn': 'onChangePassword',
            'click #setNewPasswordBtn': 'onSetNewPassword',
            'click #uploadAvatar'     : 'onUploadAvatar',
            'click #editBtn'          : 'onEdit',
            'click #saveBtn'          : 'onSave'
        },

        onChangePassword: function(e) {
            e.stopPropagation();
            e.preventDefault();

            this.template = _.template(setNewPasswordTemplate);
            this.render();
        },

        onSetNewPassword: function (e) {
            var self = this;
            var confirmedPassword;
            var userEmail;
            var password;
            var userId;
            var user;

            e.stopPropagation();
            e.preventDefault();

            userEmail = localStorage.getItem('userEmail');
            userId    = localStorage.getItem('userId');

            if (!userEmail || !userId) {

                return alert('Nope...you should login first');
            }

            confirmedPassword = this.$el.find('#confirmedPassword').val();
            password          = this.$el.find('#password').val();

            if (!password || !confirmedPassword) {

                return alert('Please fill all form\'s fields');
            }

            if (password !== confirmedPassword) {

                return alert('Password not matched');
            }

            user = new UserModel({
                password: password,
                email   : userEmail
            });

            user.urlRoot = 'lullaby/user/';

            user.save({_id: userId}, {
                success: function (response, xhr) {
                    if (response.attributes.fail) {

                        alert(response.attributes.fail);
                    } else {

                        alert('You have been successfully set new password');
                        self.template = _.template(profileTemplate);
                        self.render();
                    }
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        onUploadAvatar : function(e) {
            var self = this;
            var avatar;
            var user;

            e.stopPropagation();
            e.preventDefault();

            user = this.model;
            // get photo from upload form
            avatar = new FormData( $('form#upload').get(0) );
            // save new user photo in db
            $.ajax('lullaby/user/upload/' + user.attributes._id, {
                type:'POST',
                data: avatar,
                processData: false,
                contentType: false,
                success: function() {
                    self.template = _.template(profileTemplate);
                    self.initialize();
                },
                error: function(xhr) {
                    alert(xhr);
                }
            });
        },

        onEdit: function (e) {
            e.stopPropagation();
            e.preventDefault();

            // change current on edit profile page template
            this.template = _.template(editProfileTemplate);
            this.render();
        },

        onSave : function(e) {
            var self = this;
            var updatedOptions;
            var dayOfBirth;
            var firstname;
            var password;
            var surname;
            var street;
            var email;
            var phone;
            var city;
            var user;

            e.stopPropagation();
            e.preventDefault();

            user = self.model;

            dayOfBirth = this.$el.find('#dayOfBirth').val();
            firstname  = this.$el.find('#firstName').val();
            password   = this.$el.find('#pass').val();
            surname    = this.$el.find('#surname').val();
            street     = this.$el.find('#street').val();
            email      = this.$el.find('#email').val();
            phone      = this.$el.find('#phone').val();
            city       = this.$el.find('#city').val();

            if (!email || !phone || !password) {

                return alert('Required fields can\'t be empty');
            }

            updatedOptions = {
                firstname: firstname,
                password : password,
                birthday : dayOfBirth,
                surname  : surname,
                street   : street,
                email    : email,
                phone    : phone,
                city     : city
            };

            user.save(updatedOptions, {
                success: function (response, xhr) {
                    self.template = _.template(profileTemplate);
                    self.render();
                },
                error: function (err, xhr) {
                    alert(xhr.statusText);
                }
            });
        },

        render: function () {
            this.$el.html(this.template({user : this.model.attributes}));

            return this;
        }
    });

    return View;
});