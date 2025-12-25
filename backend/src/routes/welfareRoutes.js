const express = require('express');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const { addTransaction, getDashboard } = require('../controllers/welfareController');

const router = express.Router();

router.use(auth);

router.get('/dashboard', getDashboard);
router.post('/transactions', rbac('Admin', 'Super Admin'), addTransaction);

module.exports = router;
