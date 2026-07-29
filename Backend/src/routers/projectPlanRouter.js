const express = require('express');
const { authenticate, authorize } = require('../security/authMiddleware');
const { upload } = require('../config/multerConfig');
const {
  getAllProjectPlansHandler,
  createProjectPlanHandler,
  getProjectPlanHandler,
  updateProjectPlanHandler,
  deleteProjectPlanHandler,
} = require('../controllers/projectPlanController');

const router = express.Router();
const managers = authorize('Super Admin', 'Admin', 'Manager');
const admins = authorize('Super Admin', 'Admin');
const allStaff = authorize('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee');

router.get('/', authenticate, allStaff, getAllProjectPlansHandler);
router.post('/', authenticate, managers, upload.single('plan_document'), createProjectPlanHandler);
router.get('/:id', authenticate, allStaff, getProjectPlanHandler);
router.put('/:id', authenticate, managers, upload.single('plan_document'), updateProjectPlanHandler);
router.delete('/:id', authenticate, admins, deleteProjectPlanHandler);

module.exports = router;
