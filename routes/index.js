const express = require('express');
const router = express.Router();
const indexContrl = require('../controllers/index.controller');

// router.get('/', indexContrl.bashboard);

router.get('/login', indexContrl.login);
router.post('/login', indexContrl.login);

router.get('/logout', indexContrl.logout);

module.exports = router;
