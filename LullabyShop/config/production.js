'use strict';

// Mongoose configuration
process.env.DB_PLATFORM   = 'mongodb://';
process.env.DB_HOST       = '@ds013270.mlab.com';
process.env.DB_NAME       = 'lullaby';
process.env.DB_PORT       = '13270';
process.env.DB_USER       = 'smiranton';
process.env.DB_PASS       = 'fynjy236395';

//Server port
process.env.PORT          = 3000;

//Mail
process.env.PASSWORD      = 'fynjy236395';
process.env.SERVICE       = 'Gmail';
process.env.FROM          = 'messanger.kiev@gmail.com';
process.env.TO            = 'smiranton.kiev@gmail.com';

//Twilio
process.env.TWILIO_NUMBER = '+12013899088';
process.env.ACCOUNT_SID   = 'AC925791ae93c51ea48009a44729af467a';
process.env.AUTH_TOKEN    = '3ec94ad87063f08fdc4c472b559cecb4';

// Cookie
process.env.SECRET        = 'Beautiful life';
process.env.KEY           = 'cid';