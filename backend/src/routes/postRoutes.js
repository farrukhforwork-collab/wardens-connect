const express = require('express');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const {
  createPost,
  listPosts,
  toggleLike,
  pinPost,
  removePost
} = require('../controllers/postController');

const router = express.Router();

router.use(auth);

router.get('/', listPosts);
router.post('/', createPost);
router.patch('/:id/like', toggleLike);
router.patch('/:id/pin', rbac('Admin', 'Super Admin'), pinPost);
router.delete('/:id', removePost);

module.exports = router;
