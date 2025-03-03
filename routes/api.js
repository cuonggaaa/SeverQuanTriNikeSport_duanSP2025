const express = require('express');
const router = express.Router();


const apiBannerRoute = require('./api.banner.js');
const apiUserRoute = require('./api.user.js');
const apiCategoryRoute = require('./api.category.js');
const apiProductRoute = require('./api.product.js');

router.use('/banner', apiBannerRoute);
router.use('/user', apiUserRoute);
router.use('/category', apiCategoryRoute);
router.use('/product', apiProductRoute);

module.exports = router;
