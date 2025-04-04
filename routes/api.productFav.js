const express = require('express');
const router = express.Router();

const apiProductFav = require('../controllers/api.productFav');

router
  .route('/u/:id')
  .get((req, res, next) => apiProductFav.getByField(req, res, next, 'userId'));

router.route('/').post(apiProductFav.create).delete(apiProductFav.deleteByIduserAndProduct);

// router.route('/').post(apiProductFav.create);

router.route('/:id').delete(apiProductFav.deleteById);

module.exports = router;
