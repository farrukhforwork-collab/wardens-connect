const express = require('express');
const { seedDatabase } = require('../controllers/adminController');

const router = express.Router();

router.post('/seed', seedDatabase);

module.exports = router;
