const express = require('express');
const router = express.Router();
const indexContrl = require('../controllers/index.controller.js');

router.get('/', indexContrl.bashboard);

module.exports = router;
