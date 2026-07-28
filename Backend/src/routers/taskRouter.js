const express = require('express');
const { authenticate, authorize } = require('../security/authMiddleware');
const {
  getAllTasksHandler,
  getTaskByIdHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} = require('../controllers/taskController');
const {
  assignTaskHandler,
  listTaskAssignmentsHandler,
} = require('../controllers/employeeTaskAssignmentController');

const router = express.Router();

const managers = authorize('Super Admin', 'Admin', 'Manager');
const allStaff = authorize('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee');

router.get('/', authenticate, allStaff, getAllTasksHandler);
router.post('/', authenticate, managers, createTaskHandler);
router.post('/assign', authenticate, managers, assignTaskHandler);
router.get('/assignments', authenticate, allStaff, listTaskAssignmentsHandler);
router.get('/:id', authenticate, allStaff, getTaskByIdHandler);
router.put('/:id', authenticate, managers, updateTaskHandler);
router.delete('/:id', authenticate, managers, deleteTaskHandler);

module.exports = router;
