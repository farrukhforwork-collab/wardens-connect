const express = require('express');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const { seedDatabase, createSuperAdmin } = require('../controllers/adminController');

const router = express.Router();

router.post('/seed', seedDatabase);
router.post('/superadmin', auth, rbac('Admin', 'Super Admin'), createSuperAdmin);

module.exports = router;
