const express = require('express');
const auth = require('../middlewares/auth');
const { createGroup, listGroups } = require('../controllers/groupController');

const router = express.Router();

router.use(auth);

router.get('/', listGroups);
router.post('/', createGroup);

module.exports = router;
