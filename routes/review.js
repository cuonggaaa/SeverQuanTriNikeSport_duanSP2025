const express = require('express');
const router = express.Router();
// const { upload } = require('../service/upload.service');

const api = require('../controllers/api.productReview');

router.get('/', api.list);

// router.get('/add', api.add);
// router.post('/add', upload.single('image'), api.add);

// router.get('/edit/:id', api.edit);
// router.post('/edit/:id', upload.single('image'), api.edit);

router.get('/del/:id', api.del);
router.post('/del/:id', api.del);


module.exports = router;
