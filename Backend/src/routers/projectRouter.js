const express = require('express');
const { authenticate, authorize } = require('../security/authMiddleware');
const {
  createProjectHandler, getAllProjectsHandler, getProjectByIdHandler,
  updateProjectHandler, deleteProjectHandler,
} = require('../controllers/projectController');
const {
  assignHandler, unassignHandler, getAssignmentsHandler, getAllAssignmentsHandler,
} = require('../controllers/projectAssignmentController');

const router = express.Router();

const managers = authorize('Super Admin', 'Admin', 'Manager');
const admins   = authorize('Super Admin', 'Admin');
const allStaff = authorize('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee');

// ─── Project CRUD ──────────────────────────────────────────────────────────────
router.post(  '/',    authenticate, managers, createProjectHandler);
router.get(   '/',    authenticate, allStaff, getAllProjectsHandler);
router.get(   '/assignments/all', authenticate, allStaff, getAllAssignmentsHandler);
router.get(   '/:id', authenticate, allStaff, getProjectByIdHandler);
router.put(   '/:id', authenticate, managers, updateProjectHandler);
router.delete('/:id', authenticate, admins,   deleteProjectHandler);

// ─── Assignments ───────────────────────────────────────────────────────────────
router.get(   '/:id/assignments', authenticate, allStaff, getAssignmentsHandler);
router.post(  '/:id/assignments', authenticate, managers, assignHandler);
router.delete('/:id/assignments', authenticate, managers, unassignHandler);

module.exports = router;
