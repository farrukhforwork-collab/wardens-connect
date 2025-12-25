const express = require('express');
const auth = require('../middlewares/auth');
const { sendMessage, listMessages } = require('../controllers/messageController');

const router = express.Router();

router.use(auth);

router.get('/', listMessages);
router.post('/', sendMessage);

module.exports = router;
