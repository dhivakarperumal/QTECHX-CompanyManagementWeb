const express = require('express');
const router = express.Router();
const { authenticate } = require('../security/authMiddleware');
const { getDashboardMetrics, getEmployeeDashboardData } = require('../controllers/dashboardController');

router.get('/', getDashboardMetrics);
router.get('/employee', authenticate, getEmployeeDashboardData);

module.exports = router;
