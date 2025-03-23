const express = require('express');
const router = express.Router();


const apiBannerRoute = require('./api.banner.js');
const apiUserRoute = require('./api.user.js');
const apiCategoryRoute = require('./api.category.js');
const apiProductRoute = require('./api.product.js');
const apiPayMethodRoute = require('./api.payMethod');
const apiVoucherRoute = require('./api.voucher.js');
const apiCartRoute = require('./api.cart');
const apiOrderRoute = require('./api.order');

router.use('/banner', apiBannerRoute);
router.use('/user', apiUserRoute);
router.use('/category', apiCategoryRoute);
router.use('/product', apiProductRoute);
router.use('/pay-method', apiPayMethodRoute);
router.use('/voucher', apiVoucherRoute);
router.use('/cart', apiCartRoute);
router.use('/order', apiOrderRoute);



module.exports = router;
