const express = require('express');
const { authenticate, authorize } = require('../security/authMiddleware');
const {
  createQuotationHandler,
  getAllQuotationsHandler,
  getQuotationByIdHandler,
  updateQuotationHandler,
  deleteQuotationHandler,
  updateQuotationStatusHandler,
  duplicateQuotationHandler,
  previewQuotationHandler,
  shareQuotationHandler,
} = require('../controllers/quotationController');

const router = express.Router();
const managers = authorize('Super Admin', 'Admin', 'Manager');
const admins = authorize('Super Admin', 'Admin');
const allStaff = authorize('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee');

router.post('/', authenticate, managers, createQuotationHandler);
router.get('/', authenticate, allStaff, getAllQuotationsHandler);
router.patch('/:id/status', authenticate, managers, updateQuotationStatusHandler);
router.post('/:id/duplicate', authenticate, managers, duplicateQuotationHandler);
router.get('/:id/preview', authenticate, allStaff, previewQuotationHandler);
router.get('/:id/share', authenticate, allStaff, shareQuotationHandler);
router.get('/:id', authenticate, allStaff, getQuotationByIdHandler);
router.put('/:id', authenticate, managers, updateQuotationHandler);
router.delete('/:id', authenticate, admins, deleteQuotationHandler);

module.exports = router;
