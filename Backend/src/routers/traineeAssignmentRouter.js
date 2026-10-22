const express = require('express');
const router = express.Router();
const traineeAssignmentController = require('../controllers/traineeAssignmentController');
const { authenticate, authorize } = require('../security/authMiddleware');

router.use(authenticate, authorize('Admin', 'Super Admin', 'Manager', 'Employee'));
// Assuming some auth middleware exists, we'll try to require it or just proceed
// const authenticate = require('../middleware/authenticate'); // If it exists, add it

// POST /api/trainee-assignments
router.post('/', traineeAssignmentController.assignTrainee);

// GET /api/trainee-assignments/history/:traineeId
router.get('/history/:traineeId', traineeAssignmentController.getAssignmentHistory);

// GET /api/trainee-assignments/active-trainee-ids
router.get('/active-trainee-ids', traineeAssignmentController.getActiveTraineeIds);

// GET /api/trainee-assignments/available-employees (or route inside employees, but putting it here for simplicity)
router.get('/available-employees', traineeAssignmentController.getAvailableEmployees);

module.exports = router;
