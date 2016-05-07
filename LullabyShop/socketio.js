'use strict';

var logger = require('./helpers/logger')(module);

module.exports = function(server) {
    var io = require('socket.io').listen(server);

    io.on('connection', function (socket) {
        logger.info('New customer connected (id=' + socket.id + ')');

        socket.on('start', function (userId) {
            if (!global.clients[userId]) {

                global.clients[userId] = socket;
                socket._id = userId;
            }
        });

        socket.on('message', function (data, callback) {
            socket.broadcast.emit('message', {message: data.message});

            return callback({message: data.message, label: true});
        });

        socket.on('disconnect', function () {
            logger.info('Customer disconnected (id=' + socket._id + ')');

            global.clients[socket._id] = undefined;
        });
    });

    return io;
};

