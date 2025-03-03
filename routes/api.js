const express = require('express');
const router = express.Router();


const apiBannerRoute = require('./api.banner.js');
const apiUserRoute = require('./api.user.js');


router.use('/banner', apiBannerRoute);
router.use('/user', apiUserRoute);


module.exports = router;
