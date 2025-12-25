const express = require('express');
const { requestAccess } = require('../controllers/requestController');

const router = express.Router();

router.post('/register', requestAccess);

module.exports = router;
