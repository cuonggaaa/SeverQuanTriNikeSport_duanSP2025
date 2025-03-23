const express = require('express');
const router = express.Router();

const apiOrder = require('../controllers/api.order');

router.get('/u/:id', apiOrder.getByIdUser);
router.post('/', apiOrder.createPaymentUrl);
router.get('/vnpay-return', apiOrder.vnpayReturn);

router.put('/cancelled/:id', apiOrder.updateStatus);

module.exports = router;
