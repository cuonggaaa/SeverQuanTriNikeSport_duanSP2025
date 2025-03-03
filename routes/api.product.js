const express = require('express');
const router = express.Router();
const apiProduct = require('../controllers/api.product');

router.get('/get-all', apiProduct.getAll);

router.get('/:id', apiProduct.getById);


module.exports = router;
