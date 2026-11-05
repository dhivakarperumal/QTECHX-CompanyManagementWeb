const express = require('express');
const { authenticate, authorize } = require('../security/authMiddleware');
const { upload } = require('../config/multerConfig');
const {
  createDemoProjectHandler,
  getAllDemoProjectsHandler,
  getDemoProjectsPublicHandler,
  getNextDemoProjectCodeHandler,
  getDemoProjectByIdHandler,
  updateDemoProjectHandler,
  deleteDemoProjectHandler,
} = require('../controllers/demoProjectController');

const router = express.Router();

const managers = authorize('Super Admin', 'Admin', 'Manager');
const admins   = authorize('Super Admin', 'Admin');
const allStaff = authorize('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee');

const uploadFields = upload.fields([
  { name: 'proposal_doc',       maxCount: 1 },
  { name: 'quotation_doc',      maxCount: 1 },
  { name: 'agreement_doc',      maxCount: 1 },
  { name: 'nda_doc',            maxCount: 1 },
  { name: 'api_documentation',  maxCount: 1 },
  { name: 'database_schema',    maxCount: 1 },
  { name: 'source_code_backup', maxCount: 1 },
  { name: 'project_images',     maxCount: 20 },
]);

// ─── Public (no auth) ──────────────────────────────────────────────────────────
router.get(   '/public/all', getDemoProjectsPublicHandler);

// ─── Demo Project CRUD ─────────────────────────────────────────────────────────
router.post(  '/',          authenticate, managers, uploadFields, createDemoProjectHandler);
router.get(   '/next-code', authenticate, managers, getNextDemoProjectCodeHandler);
router.get(   '/',          authenticate, allStaff, getAllDemoProjectsHandler);
router.get(   '/:id',       authenticate, allStaff, getDemoProjectByIdHandler);
router.put(   '/:id',       authenticate, managers, uploadFields, updateDemoProjectHandler);
router.delete('/:id',       authenticate, admins,   deleteDemoProjectHandler);

module.exports = router;
