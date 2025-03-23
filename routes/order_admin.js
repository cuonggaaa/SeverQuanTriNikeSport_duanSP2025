const express = require('express');
const router = express.Router();
const api_order = require('../controllers/api.order');
const multer = require('multer');
const upload = multer();

router.get('/', api_order.order_list);
router.post('/', upload.none(), api_order.order_list);

// router.get('/detail/:id', api_order.appointment_detail);


module.exports = router;
