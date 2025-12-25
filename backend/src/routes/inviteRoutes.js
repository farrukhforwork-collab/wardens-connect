const express = require('express');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const {
  createInvite,
  getInvite,
  registerWithInvite
} = require('../controllers/inviteController');

const router = express.Router();

router.post('/', auth, rbac('Admin', 'Super Admin'), createInvite);
router.get('/:token', getInvite);
router.post('/:token/register', registerWithInvite);

module.exports = router;
