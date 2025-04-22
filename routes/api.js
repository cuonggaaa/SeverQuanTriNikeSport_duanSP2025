const express = require('express');
const router = express.Router();


const apiBannerRoute = require('./api.banner');
const apiUserRoute = require('./api.user');
const apiCategoryRoute = require('./api.category');
const apiProductRoute = require('./api.product');
const apiProductRiviewRoute = require('./api.productReview');
const apiProductFavRoute = require('./api.productFav');
const apiPayMethodRoute = require('./api.payMethod');
const apiVoucherRoute = require('./api.voucher');
const apiCartRoute = require('./api.cart');
const apiOrderRoute = require('./api.order');
const apiNotiRoute = require('./api.noti');

// const apiGradesRoute = require('./api.grades');
// const apiTuitionPaymentRoute = require('./api.tuitionPayment');
// const apiScholarshipRoute = require('./api.scholarship');

router.use('/banner', apiBannerRoute);
router.use('/user', apiUserRoute);
router.use('/category', apiCategoryRoute);
router.use('/product', apiProductRoute);
router.use('/product-review', apiProductRiviewRoute);
router.use('/product-fav', apiProductFavRoute);
router.use('/pay-method', apiPayMethodRoute);
router.use('/voucher', apiVoucherRoute);
router.use('/cart', apiCartRoute);
router.use('/order', apiOrderRoute);
router.use('/noti', apiNotiRoute);

// router.use('/grades', apiGradesRoute);
// router.use('/tuition', apiTuitionPaymentRoute);
// router.use('/scholarship', apiScholarshipRoute);


module.exports = router;
