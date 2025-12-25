const express = require('express');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const { createReport, listReports } = require('../controllers/reportController');

const router = express.Router();

router.use(auth);

router.post('/', createReport);
router.get('/', rbac('Moderator', 'Admin', 'Super Admin'), listReports);

module.exports = router;
