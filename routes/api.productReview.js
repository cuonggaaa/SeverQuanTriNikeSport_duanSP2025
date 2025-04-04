const express = require('express');
const router = express.Router();

const apiProductReview = require('../controllers/api.productReview');

router
  .route('/p/:id')
  .get((req, res, next) =>
    apiProductReview.getByField(req, res, next, 'productId')
  );

router
  .route('/u/:id')
  .get((req, res, next) =>
    apiProductReview.getByField(req, res, next, 'userId')
  );

router.route('/').post(apiProductReview.create);

router.route('/:id').delete(apiProductReview.deleteById);

// router.param('id', apiProductReview.load);

module.exports = router;
