const express = require('express');
const auth = require('../middlewares/auth');
const { listNotifications, markRead } = require('../controllers/notificationController');

const router = express.Router();

router.use(auth);

router.get('/', listNotifications);
router.patch('/read', markRead);

module.exports = router;
