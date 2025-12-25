const express = require('express');
const auth = require('../middlewares/auth');
const { createPage, listPages } = require('../controllers/pageController');

const router = express.Router();

router.use(auth);

router.get('/', listPages);
router.post('/', createPage);

module.exports = router;
