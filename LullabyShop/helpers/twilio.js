var env    = process.env;
var client = require('twilio')(env.ACCOUNT_SID, env.AUTH_TOKEN);

module.exports = function () {

    function sendSms (userPhone, tokenPhoneSecret, callback) {
        var phoneNumber = userPhone
                        .replace('(', '')
                        .replace(')', '')
                        .replace(/-/g, '')
                        .replace('(', '');

        client.sendMessage({
            to  : phoneNumber,
            from: env.TWILIO_NUMBER,
            body: tokenPhoneSecret
        }, function (err, responseData) {

            return callback(err, responseData);
        });
    }

    return {
        sendSms: sendSms
    }
};

