const express = require('express');
const router = express.Router();

const { upload } = require('../service/upload.service.js');

const apiUser = require('../controllers/api.user.js');

router.route('/').get(apiUser.getAll);

router
  .route('/:userId')
  .get(apiUser.getById)
  .put(upload.single('image'), apiUser.updateById);

router.post('/register', apiUser.addUser);
router.post('/login', apiUser.userLogin);
router.post('/change-password/:userId', apiUser.changePassword);

module.exports = router;
