const express = require('express');
const router = express.Router();

const apiCategory = require('../controllers/api.category');

router.get('/get-all', apiCategory.getAll);

router.get('/:id', apiCategory.getById);

module.exports = router;
