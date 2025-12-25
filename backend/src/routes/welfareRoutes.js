const express = require('express');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const {
  addTransaction,
  getDashboard,
  listPolls,
  createPoll,
  votePoll,
  closePoll
} = require('../controllers/welfareController');

const router = express.Router();

router.use(auth);

router.get('/dashboard', getDashboard);
router.post('/transactions', rbac('Admin', 'Super Admin'), addTransaction);
router.get('/polls', listPolls);
router.post('/polls', rbac('Admin', 'Super Admin'), createPoll);
router.post('/polls/:id/vote', votePoll);
router.patch('/polls/:id/close', rbac('Admin', 'Super Admin'), closePoll);

module.exports = router;
