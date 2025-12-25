const express = require('express');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const {
  createUser,
  listPending,
  approveUser,
  listUsers,
  updateUserRole,
  blockUser,
  updateMe
} = require('../controllers/userController');

const router = express.Router();

router.use(auth);

router.post('/', rbac('Admin', 'Super Admin'), createUser);
router.get('/', rbac('Admin', 'Super Admin'), listUsers);
router.get('/pending', rbac('Admin', 'Super Admin'), listPending);
router.patch('/me', updateMe);
router.patch('/:id/approve', rbac('Admin', 'Super Admin'), approveUser);
router.patch('/:id/role', rbac('Admin', 'Super Admin'), updateUserRole);
router.patch('/:id/block', rbac('Admin', 'Super Admin'), blockUser);

module.exports = router;
