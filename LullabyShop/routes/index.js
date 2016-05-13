'use strict';

module.exports = function (app) {
    var subscriberRoute = require('../routes/subscriber')();
    var newsletterRoute = require('../routes/newsletter')();
    var reminderRoute   = require('../routes/reminder')();
    var categoryRoute   = require('../routes/category')();
    var productRoute    = require('../routes/product')();
    var contactRoute    = require('../routes/contact')();
    var commentRoute    = require('../routes/comment')();
    var basketRoute     = require('../routes/basket')();
    var orderRoute      = require('../routes/order')();
    var authRoute       = require('../routes/auth')();
    var blogRoute       = require('../routes/blog')();
    var userRoute       = require('../routes/user')();

    app.use('/',                   authRoute);
    app.use('/lullaby/user',       userRoute);
    app.use('/lullaby/blog',       blogRoute);
    app.use('/lullaby/order',      orderRoute);
    app.use('/lullaby/basket',     basketRoute);
    app.use('/lullaby/comment',    commentRoute);
    app.use('/lullaby/product',    productRoute);
    app.use('/lullaby/reminder',   reminderRoute);
    app.use('/lullaby/contacts',   contactRoute);
    app.use('/lullaby/category',   categoryRoute);
    app.use('/lullaby/subscriber', subscriberRoute);
    app.use('/lullaby/newsletter', newsletterRoute);

    return app;
};
