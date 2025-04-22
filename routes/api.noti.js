const express = require('express');
const router = express.Router();

const apiNoti = require('../controllers/api.noti');

router.get('/u/:id', apiNoti.findByIdUser);

router.get('/:id', apiNoti.findById);

module.exports = router;
