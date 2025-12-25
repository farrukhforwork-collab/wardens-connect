const express = require('express');
const { login, me } = require('../controllers/authController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', auth, me);

module.exports = router;
