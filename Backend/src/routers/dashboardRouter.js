const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../security/authMiddleware');
const { getDashboardMetrics, getEmployeeDashboardData } = require('../controllers/dashboardController');

router.get('/', authenticate, authorize('Super Admin', 'Admin'), getDashboardMetrics);
router.get('/employee', authenticate, getEmployeeDashboardData);

module.exports = router;
