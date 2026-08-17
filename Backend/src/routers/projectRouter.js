const express = require('express');
const { authenticate, authorize } = require('../security/authMiddleware');
const { upload } = require('../config/multerConfig');
const {
  createProjectHandler, getAllProjectsHandler, getNextProjectCodeHandler, getProjectByIdHandler,
  updateProjectHandler, deleteProjectHandler, getProjectProgressHandler,
} = require('../controllers/projectController');
const {
  assignHandler,
  unassignHandler,
  updateAssignmentHandler,
  updateAssignmentsHandler,
  getAssignmentsHandler,
  getAllAssignmentsHandler,
  searchEmployeesHandler,
} = require('../controllers/projectAssignmentController');

const router = express.Router();

const managers = authorize('Super Admin', 'Admin', 'Manager');
const admins   = authorize('Super Admin', 'Admin');
const allStaff = authorize('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee');
const uploadFields = upload.fields([
  { name: 'proposal_doc', maxCount: 1 },
  { name: 'quotation_doc', maxCount: 1 },
  { name: 'agreement_doc', maxCount: 1 },
  { name: 'nda_doc', maxCount: 1 },
  { name: 'api_documentation', maxCount: 1 },
  { name: 'database_schema', maxCount: 1 },
  { name: 'source_code_backup', maxCount: 1 },
  { name: 'project_images', maxCount: 20 },
]);

// ─── Project CRUD ──────────────────────────────────────────────────────────────
// Public endpoint - no authentication required
router.get(   '/public/all', getAllProjectsHandler);

router.post(  '/',    authenticate, managers, uploadFields, createProjectHandler);
router.get(   '/next-code', authenticate, managers, getNextProjectCodeHandler);
router.get(   '/',    authenticate, allStaff, getAllProjectsHandler);
router.get(   '/assignments/all', authenticate, allStaff, getAllAssignmentsHandler);

// ─── Assignments ───────────────────────────────────────────────────────────────
router.get(   '/employees/search', authenticate, allStaff, searchEmployeesHandler);
router.get(   '/:id/assignments', authenticate, allStaff, getAssignmentsHandler);
router.post(  '/:id/assignments', authenticate, managers, assignHandler);
router.put(   '/:id/assignments', authenticate, managers, updateAssignmentsHandler);
router.put(   '/:id/assignments/:assignmentId', authenticate, managers, updateAssignmentHandler);
router.delete('/:id/assignments', authenticate, managers, unassignHandler);

router.get(   '/:id/progress', authenticate, allStaff, getProjectProgressHandler);
router.get(   '/:id', authenticate, allStaff, getProjectByIdHandler);
router.put(   '/:id', authenticate, managers, uploadFields, updateProjectHandler);
router.delete('/:id', authenticate, admins,   deleteProjectHandler);

module.exports = router;
