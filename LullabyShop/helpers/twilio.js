var env    = process.env;
var client = require('twilio')(env.ACCOUNT_SID, env.AUTH_TOKEN);

var twilio = (function () {

    function sendSms (userPhone, tokenPhoneSecret, callback) {
        client.sendMessage({
            to  : userPhone,
            from: env.TWILIO_NUMBER,
            body: tokenPhoneSecret
        }, function (err, responseData) {

            return callback(err, responseData);
        });
    }

    return {
        sendSms: sendSms
    }
}());

module.exports = twilio;

