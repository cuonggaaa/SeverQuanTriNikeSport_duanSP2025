const express = require('express');
const router = express.Router();

const apiBanner = require('../controllers/api.banner.js');

router.get('/get-all', apiBanner.getAll);

module.exports = router;
