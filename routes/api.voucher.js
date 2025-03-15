const express = require('express');
const router = express.Router();

const apiVoucher = require('../controllers/api.voucher');

router.get('/get-all', apiVoucher.getAll);

module.exports = router;
