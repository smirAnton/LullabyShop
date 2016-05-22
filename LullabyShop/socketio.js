'use strict';

var logger = require('./helpers/logger')(module);

module.exports = function(server) {
    var io = require('socket.io').listen(server);

    io.on('connection', function (socket) {
        logger.info('New customer connected (id=' + socket.id + ')');

        socket.on('start', function (userFirstname, callback) {
            if (!global.clients[socket.id]) {
                global.clients[socket.id] = socket;
                socket.userFirstname = userFirstname;
            } else {
                socket.userFirstname = userFirstname;
            }

            logger.info('New customer connected (name='
                + socket.userFirstname
                + ', connected time='
                + new Date().toLocaleTimeString() + ');');
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

