const express = require('express');
const { authenticate, authorize } = require('../security/authMiddleware');
const {
  createQuotationHandler,
  getAllQuotationsHandler,
  getQuotationByIdHandler,
  updateQuotationHandler,
  deleteQuotationHandler,
} = require('../controllers/quotationController');

const router = express.Router();
const managers = authorize('Super Admin', 'Admin', 'Manager');
const admins = authorize('Super Admin', 'Admin');
const allStaff = authorize('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee');

router.post('/', authenticate, managers, createQuotationHandler);
router.get('/', authenticate, allStaff, getAllQuotationsHandler);
router.get('/:id', authenticate, allStaff, getQuotationByIdHandler);
router.put('/:id', authenticate, managers, updateQuotationHandler);
router.delete('/:id', authenticate, admins, deleteQuotationHandler);

module.exports = router;
