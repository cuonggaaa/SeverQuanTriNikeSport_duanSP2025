const express = require('express');
const router = express.Router();

const api_cart = require('../controllers/api.cart');

router.post('/', api_cart.addCart); // 2
router.get('/get-all', api_cart.getAll);
router.get('/u/:id', api_cart.getByUserId); // 1

router
  .route('/:id')
  .get(api_cart.getById)
  .put(api_cart.updateById)
  .delete(api_cart.deleteById);

module.exports = router;
