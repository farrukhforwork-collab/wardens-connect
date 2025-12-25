const express = require('express');
const auth = require('../middlewares/auth');
const { addComment, listComments } = require('../controllers/commentController');

const router = express.Router();

router.use(auth);

router.get('/:postId', listComments);
router.post('/:postId', addComment);

module.exports = router;
