const express = require('express');
const router = express.Router();
const projectPaymentController = require('../controllers/projectPaymentController');

router.post('/', projectPaymentController.createProjectPayment);
router.get('/', projectPaymentController.getProjectPayments);
router.get('/:projectId/summary', projectPaymentController.getProjectPaymentSummary);
router.put('/:id', projectPaymentController.updateProjectPayment);
router.delete('/:id', projectPaymentController.deleteProjectPayment);

module.exports = router;
