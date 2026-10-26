const express = require('express');
const router = express.Router();
const projectPaymentController = require('../controllers/projectPaymentController');
const { authenticate, authorize } = require('../security/authMiddleware');
const financeAdmins = [authenticate, authorize('Super Admin', 'Admin')];

router.post('/', ...financeAdmins, projectPaymentController.createProjectPayment);
router.get('/', ...financeAdmins, projectPaymentController.getProjectPayments);
router.get('/:projectId/summary', ...financeAdmins, projectPaymentController.getProjectPaymentSummary);
router.put('/:id', ...financeAdmins, projectPaymentController.updateProjectPayment);
router.delete('/:id', ...financeAdmins, projectPaymentController.deleteProjectPayment);

module.exports = router;
