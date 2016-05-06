'use strict';

var multiparty = require('multiparty');
var gm         = require('gm');
var fs         = require('fs');

module.exports = function () {

    // template to upload and resize image to necessary dimensions
    function uploadAndResizeImage(req, pathToSaveImage, imageDimensions, callback) {
        var form = new multiparty.Form();

        form.parse(req, function (err, field, files) {
            var image;
            var path;
            // grab image
            image = files.attachment[0];
            // define updated file path
            path = pathToSaveImage + image.originalFilename;
            // resize and save image
            gm(image.path)
                .resize(imageDimensions.width, imageDimensions.height)
                .write(path, function (err, result) {
                    if (err) {

                        return callback(err);
                    }

                    return callback(null, path)
                });
        })
    }

    // template to upload images for blog topics and product
    function uploadImage(req, folderPathToSave, callback) {
        var form = new multiparty.Form();

        form.parse(req, function (err, field, files) {
            var image;
            var path;

            // grub image
            image = files.attachment[0];
            fs.readFile(image.path, function (err, data) {

                // define folder to save image
                path = folderPathToSave + image.originalFilename;

                // save it in images folder
                fs.writeFile(path, data, function (err, result) {
                    if (err) {

                        return callback(err);
                    }
                    // just return path to photo if upload was successful
                    return callback(null, path);
                })
            });
        });
    }

    function uploadUserAvatar(req, callback) {
        uploadAndResizeImage(req, 'public/images/avatars/', {width: 200, height: 200}, function (err, path) {
            if (err) {

                return callback(err);
            }

            return callback(null, path);
        })
    }

    function uploadBlogPicture(req, callback) {
        uploadImage(req, 'public/images/blogs/', function (err, result) {
            if (err) {

                return callback(err);
            }

            return callback(null, result);
        })
    }

    function uploadProductPicture(req, callback) {
        uploadImage(req, 'public/images/product/', function (err, result) {
            if (err) {

                return callback(err);
            }

            return callback(null, result);
        })
    }

    return {
        uploadProductPicture: uploadProductPicture,
        uploadBlogPicture   : uploadBlogPicture,
        uploadUserAvatar    : uploadUserAvatar
    }
};


