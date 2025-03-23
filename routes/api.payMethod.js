const express = require('express');
const router = express.Router();

const apiPayMethod = require('../controllers/api.payMethod');

router.get('/get-all', apiPayMethod.getAll);

module.exports = router;
