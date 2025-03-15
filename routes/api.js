const express = require('express');
const router = express.Router();


const apiBannerRoute = require('./api.banner.js');
const apiUserRoute = require('./api.user.js');
const apiCategoryRoute = require('./api.category.js');
const apiProductRoute = require('./api.product.js');
const apiVoucherRoute = require('./api.voucher.js');

router.use('/banner', apiBannerRoute);
router.use('/user', apiUserRoute);
router.use('/category', apiCategoryRoute);
router.use('/product', apiProductRoute);
router.use('/voucher', apiVoucherRoute);



module.exports = router;
